import { NearbyRide } from '@location-destination/types/src/ride';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as socketio from 'socket.io';

export type ClientToServerEvents = {
  offerRide: (currentLocation: { lat: number; lng: number }) => void;
  findRide: (rideId: string, preferredVehicle: ('Electric' | 'Hybrid' | 'Gas')[], passengers: number) => void;
};

export type ServerToClientEvents = {
  invalidAddress: (error: string) => void;
  nearbyRides: (nearbyRides: NearbyRide[]) => void;
};

export type SocketData = {
  user: DecodedIdToken;
};

export type Socket = socketio.Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  socketio.DefaultEventsMap,
  SocketData
>;
