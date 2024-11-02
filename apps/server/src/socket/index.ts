import * as config from '../config';
import { Server as HttpServer } from 'http';
import { DefaultEventsMap, Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware } from '../middleware/auth';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  Socket,
} from '../types/socket';
import { onOfferRide } from './driver';
import { onFindRide, onRide } from './rider';

const onConnect = async (socket: Socket) => {
  console.log(`Client ${socket.data.user.email} connected`);

  socket.on('offerRide', onOfferRide(socket));
  socket.on('findRide', onFindRide(socket));
  socket.on('ride', onRide(socket));
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
