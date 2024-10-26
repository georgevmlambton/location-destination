import { VehicleType } from './requests/profile';

export type NearbyRide = {
  id: string;
  car: string;
  type?: VehicleType;
  waitTimeMinutes: number;
};
