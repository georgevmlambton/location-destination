import { User } from '../db/user';
import mongoose from 'mongoose';
import { geocodeAddress, getDrivingDurationMinutes } from '../maps';
import { IRide, Ride } from '../db/ride';
import { redis, redisEvents } from '../redis';
import { GeoReplyWith } from 'redis';
import { NearbyRide } from '@location-destination/types/src/ride';
import { Socket } from '../types/socket';

export const onFindRide = (socket: Socket) => async (rideId: string) => {
  const user = await User.findOne({ uid: socket.data.user.uid });

  if (!user) {
    socket.disconnect(true);
    return;
  }

  if (!mongoose.isValidObjectId(rideId)) {
    console.error(`Invalid rideId: ${rideId}`);
    socket.disconnect(true);
    return;
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    socket.disconnect(true);
    return;
  }

  const pickupCoordinates = await geocodeAddress(ride.pickupAddress);

  if (!pickupCoordinates || !ride.preferredVehicle || !ride.passengers) {
    return;
  }

  const find = async () => {
    const nearbyRides = await findNearbyDrivers(pickupCoordinates, ride);

    socket.emit('nearbyRides', nearbyRides);
  };

  const confirm = async (driverId: string) => {
    const driver = await User.findOne({ uid: driverId });
    if (!driver) {
      return;
    }
    ride.driver = driver.id;
    ride.state = 'PickingUp';
    await ride.save();
    socket.emit('confirmRide', {
      id: ride.id,
      createdBy: { name: user.name || '' },
      driver: { name: driver?.name || '' },
      dropoffAddress: ride.dropoffAddress,
      pickupAddress: ride.pickupAddress,
      passengers: ride.passengers,
      preferredVehicle: ride.preferredVehicle,
      state: ride.state,
    });
  };

  find();

  redisEvents.subscribe('driverLocationUpdate', find);

  redisEvents.subscribe(`confirmRide:${ride.id}`, confirm);

  socket.on('requestRide', (driverId) => {
    redis.publish(`requestRide:${driverId}`, ride.id);
  });

  socket.on('disconnect', () => {
    redisEvents.unsubscribe('driverLocationUpdate', find);
    redisEvents.unsubscribe(`confirmRide:${ride.id}`, confirm);
  });
};

async function findNearbyDrivers(
  pickupCoordinates: { lat: number; lng: number },
  ride: IRide & {
    _id: mongoose.Types.ObjectId;
  }
) {
  const nearbyDrivers = await redis.geoRadiusWith(
    'drivers',
    {
      longitude: pickupCoordinates.lng,
      latitude: pickupCoordinates.lat,
    },
    5,
    'km',
    [GeoReplyWith.COORDINATES],
    { SORT: 'ASC' }
  );

  if (!nearbyDrivers.length) {
    return [];
  }

  const drivers = await User.find({
    uid: { $in: nearbyDrivers.map((d) => d.member) },
  });

  const rides: NearbyRide[] = [];

  for (const driver of drivers) {
    if (
      driver.vehicle?.capacity &&
      driver.vehicle.capacity >= ride.passengers &&
      ride.preferredVehicle &&
      ((driver.vehicle.vehicleType &&
        ride.preferredVehicle.includes(driver.vehicle.vehicleType)) ||
        ride.preferredVehicle.length == 0)
    ) {
      const driverCoordinates = nearbyDrivers.find(
        (d) => d.member === driver.uid
      )?.coordinates;

      if (!driverCoordinates) {
        continue;
      }

      if (await redis.sIsMember(`rejectedRides:${ride._id}`, driver.uid)) {
        continue;
      }

      const duration = await getDrivingDurationMinutes(pickupCoordinates, {
        lat: Number(driverCoordinates.latitude),
        lng: Number(driverCoordinates.longitude),
      });

      rides.push({
        id: driver.uid,
        car: `${driver.vehicle?.year} ${driver.vehicle?.make} ${driver.vehicle?.model}`,
        type: driver.vehicle?.vehicleType,
        waitTimeMinutes: Math.round(duration || 0),
      });
    }
  }

  return rides;
}
