import * as config from './config';
import { Server as HttpServer } from 'http';
import { DefaultEventsMap, Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware } from './middleware/auth';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  Socket,
} from './types/socket';
import { redis } from './redis';
import { geocodeAddress, getDrivingDurationMinutes } from './maps';
import { Ride } from './db/ride';
import { User } from './db/user';
import { GeoReplyWith } from 'redis';
import { NearbyRide } from '@location-destination/types/src/ride';
import { VehicleType } from '@location-destination/types/src/requests/profile';
import mongoose from 'mongoose';

const redisEvents = await redis.duplicate().connect();

const onConnect = async (socket: Socket) => {
  console.log(`Client ${socket.data.user.email} connected`);

  socket.on('disconnect', onDisconnect(socket));
  socket.on('offerRide', onOfferRide(socket));
  socket.on('findRide', onFindRide(socket));
};

const onDisconnect = (socket: Socket) => async () => {
  console.log(`Client ${socket.data.user.email} disconnected`);
  await redis.ZREM('drivers', socket.data.user.uid);
  redis.publish('driverLocationUpdate', '');
};

const onOfferRide =
  (socket: Socket) => async (location: { lat: number; lng: number }) => {
    await redis.GEOADD('drivers', {
      longitude: location.lng,
      latitude: location.lat,
      member: socket.data.user.uid,
    });

    socket.on('driverLocation', async (location) => {
      await redis.GEOADD('drivers', {
        longitude: location.lng,
        latitude: location.lat,
        member: socket.data.user.uid,
      });

      redis.publish('driverLocationUpdate', '');
    });

    redisEvents.subscribe(
      `requestRide:${socket.data.user.uid}`,
      async (rideId: string) => {
        const ride = await Ride.findById(rideId);

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
            dropoffAddress: ride.dropoffAddress,
            pickupAddress: ride.pickupAddress,
            passengers: ride.passengers,
            state: ride.state,
          },
          duration || 0
        );
      }
    );

    redis.publish('driverLocationUpdate', '');

    socket.on('disconnect', () => {
      redisEvents.unsubscribe(`requestRide:${socket.data.user.uid}`);
    });
  };

const onFindRide = (socket: Socket) => async (rideId: string) => {
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
    const nearbyRides = await findNearbyDrivers(
      pickupCoordinates,
      ride.passengers,
      ride.preferredVehicle
    );

    socket.emit('nearbyRides', nearbyRides);
  };

  find();

  redisEvents.subscribe('driverLocationUpdate', find);

  socket.on('requestRide', (driverId) => {
    redis.publish(`requestRide:${driverId}`, ride.id);
  });

  socket.on('disconnect', () => {
    redisEvents.unsubscribe('driverLocationUpdate', find);
  });
};

async function findNearbyDrivers(
  pickupCoordinates: { lat: number; lng: number },
  passengers: number,
  preferredVehicle?: VehicleType[]
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
      driver.vehicle.capacity >= passengers &&
      preferredVehicle &&
      ((driver.vehicle.vehicleType &&
        preferredVehicle.includes(driver.vehicle.vehicleType)) ||
        preferredVehicle.length == 0)
    ) {
      const driverCoordinates = nearbyDrivers.find(
        (d) => d.member === driver.uid
      )?.coordinates;

      if (!driverCoordinates) {
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

export function initializeSocket(server: HttpServer) {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    DefaultEventsMap,
    SocketData
  >(server, {
    cors: { origin: config.frontendUrl, methods: '*' },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', onConnect);
}
