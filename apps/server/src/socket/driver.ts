import { Ride } from '../db/ride';
import { IUser } from '../db/user';
import { geocodeAddress, getDrivingDurationMinutes } from '../maps';
import { redis, redisEvents } from '../redis';
import { Socket } from '../types/socket';

export const onOfferRide =
  (socket: Socket) => async (location: { lat: number; lng: number }) => {
    const sendEndRide = () => {
      socket.emit('endRide');
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
      redisEvents.subscribe(`endRide:${rideId}`, sendEndRide);
      redis.publish(`confirmRide:${rideId}`, socket.data.user.uid);

      socket.on('cancelRide', () => {
        redis.publish(`endRide:${rideId}`, '');
      });

      socket.on('disconnect', () =>
        redisEvents.unsubscribe(`endRide:${rideId}`, sendEndRide)
      );
    });

    socket.on('startRide', async (rideId) => {
      await Ride.findByIdAndUpdate(rideId, { state: 'Started' });
      try {
        const result = await redis.publish(`startRide:${rideId}`, socket.data.user.uid);
      } catch (err) {
        console.error('Error publishing to Redis:', err);
      }
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
