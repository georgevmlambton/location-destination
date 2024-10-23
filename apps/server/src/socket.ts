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
import { geocodeAddress } from './maps';

const redisEvents = await redis.duplicate().connect();

const onConnect = async (socket: Socket) => {
  console.log(`Client ${socket.data.user.email} connected`);

  socket.on('disconnect', onDisconnect(socket));
  socket.on('offerRide', onOfferRide(socket));
};

const onDisconnect = (socket: Socket) => () => {
  console.log(`Client ${socket.data.user.email} disconnected`);
};

const onOfferRide = (socket: Socket) => async (currentLocation: string) => {
  const location = await geocodeAddress(currentLocation);

  if (!location) {
    socket.emit('invalidAddress', currentLocation);
    return;
  }

  await redis.GEOADD('drivers', {
    longitude: location.lng,
    latitude: location.lat,
    member: socket.data.user.uid,
  });

  redisEvents.publish('rides', 'driverLocationUpdate');

  socket.on('disconnect', async () => {
    await redis.ZREM('drivers', socket.data.user.uid);
    redisEvents.publish('rides', 'driverLocationUpdate');
  });
};

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
