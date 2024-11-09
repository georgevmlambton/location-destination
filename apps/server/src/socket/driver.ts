import { Ride } from '../db/ride';
import { IUser } from '../db/user';
import {
  geocodeAddress,
  getDrivingDistanceMeters,
  getDrivingDurationMinutes,
} from '../maps';
import { redis, redisEvents } from '../redis';
import { Socket } from '../types/socket';

export const onOfferRide =
  (socket: Socket) => async (location: { lat: number; lng: number }) => {
    const sendCancelRide = () => {
      socket.emit('cancelRide');
    };

    socket.on('driverLocation', (location) => updateLocation(socket, location));

    redisEvents.subscribe(
      `requestRide:${socket.data.user.uid}`,
      (rideId: string) => onRequestRide(socket, rideId)
    );

    socket.on('rejectRide', async (rideId) => {
      await redis.sAdd(`rejectedRides:${rideId}`, socket.data.user.uid);
      redis.publish('driverLocationUpdate', '');
    });

    socket.on('confirmRide', (rideId) => {
      redisEvents.subscribe(`cancelRide:${rideId}`, sendCancelRide);
      redis.publish(`confirmRide:${rideId}`, socket.data.user.uid);

      socket.on('cancelRide', () => {
        redisEvents.unsubscribe(`cancelRide:${rideId}`, sendCancelRide);
        redis.publish(`cancelRide:${rideId}`, '');
      });

      socket.on('disconnect', () =>
        redisEvents.unsubscribe(`cancelRide:${rideId}`, sendCancelRide)
      );
    });

    socket.on('startRide', async (rideId) => {
      await Ride.findByIdAndUpdate(rideId, { state: 'Started' });
      try {
        await redis.publish(`startRide:${rideId}`, socket.data.user.uid);
      } catch (err) {
        console.error('Error publishing to Redis:', err);
      }
    });

    socket.on('dropoff', async (rideId: string, callback) => {
      const ride = await Ride.findById(rideId);

      if (!ride) {
        console.log('Ride not found');
        return;
      }

      const distanceMeters = await getDrivingDistanceMeters(
        ride.pickupAddress,
        ride.dropoffAddress
      );
      const baseFare = 2 * 100;
      const ratePerKm = 1;
      const distanceFare = Math.round(
        (distanceMeters / 1000) * ratePerKm * 100
      );
      const subtotal = baseFare + distanceFare;
      const taxPercent = 13;
      const tax = Math.round((taxPercent / 100) * subtotal);
      const total = subtotal + tax;
      const driverPercent = 70;
      const driver = Math.round((driverPercent / 100) * total);

      ride.payment = {
        baseFare,
        ratePerKm,
        distanceFare,
        subtotal,
        taxPercent,
        tax,
        total,
        driverPercent,
        driver,
      };

      await ride.save();

      callback();

      redis.publish(`endRide:${rideId}`, '');
    });

    socket.on('disconnect', async () => {
      redisEvents.unsubscribe(`requestRide:${socket.data.user.uid}`);
      await redis.ZREM('drivers', socket.data.user.uid);
      redis.publish('driverLocationUpdate', '');
    });

    await updateLocation(socket, location);
  };

async function updateLocation(
  socket: Socket,
  location: { lat: number; lng: number }
) {
  await redis.GEOADD('drivers', {
    longitude: location.lng,
    latitude: location.lat,
    member: socket.data.user.uid,
  });

  redis.publish('driverLocationUpdate', '');
}

async function onRequestRide(socket: Socket, rideId: string) {
  const ride = await Ride.findById(rideId).populate<{ createdBy: IUser }>(
    'createdBy'
  );

  if (!ride || !ride?.pickupAddress) {
    console.error('Invalid Ride');
    return;
  }

  const pickupCoordinates = await geocodeAddress(ride.pickupAddress);

  const driverCoordinates = (
    await redis.geoPos('drivers', socket.data.user.uid)
  )?.[0];

  if (!driverCoordinates || !pickupCoordinates) {
    console.error('Location missing');
    return;
  }

  const duration = await getDrivingDurationMinutes(pickupCoordinates, {
    lat: Number(driverCoordinates.latitude),
    lng: Number(driverCoordinates.longitude),
  });

  socket.emit(
    'requestRide',
    {
      id: ride.id,
      createdBy: { name: ride.createdBy.name || '' },
      dropoffAddress: ride.dropoffAddress,
      pickupAddress: ride.pickupAddress,
      passengers: ride.passengers,
      state: ride.state,
    },
    duration || 0
  );
}
