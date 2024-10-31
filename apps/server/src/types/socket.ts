import { NearbyRide } from '@location-destination/types/src/ride';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as socketio from 'socket.io';
import { RideResponse } from '@location-destination/types/src/requests/ride';

export type ClientToServerEvents = {
  offerRide: (currentLocation: { lat: number; lng: number }) => void;
  driverLocation: (currentLocation: { lat: number; lng: number }) => void;
  findRide: (
    rideId: string,
    preferredVehicle: ('Electric' | 'Hybrid' | 'Gas')[],
    passengers: number
  ) => void;
  requestRide: (driverId: string) => void;
  rejectRide: (rideId: string) => void;
};

export type ServerToClientEvents = {
  invalidAddress: (error: string) => void;
  nearbyRides: (nearbyRides: NearbyRide[]) => void;
  requestRide: (ride: RideResponse, distanceMin: number) => void;
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
