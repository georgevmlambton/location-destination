import { VehicleType } from '@location-destination/types/src/requests/profile';
import { ObjectId, Schema, model, Types } from 'mongoose';

export interface IRide {
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  preferredVehicle?: ('Electric' | 'Hybrid' | 'Gas')[];
  state: 'Searching' | 'Cancelled' | 'PickingUp' | 'Started' | 'Completed';
  createdBy: ObjectId;
  driver?: ObjectId;
  payment?: {
    baseFare: number;
    ratePerKm: number;
    distanceFare: number;
    subtotal: number;
    taxPercent: number;
    tax: number;
    total: number;
    driverPercent: number;
    driver: number;
  };
}

const rideSchema = new Schema<IRide>({
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  state: { type: String, required: true },
  passengers: { type: Number, required: true },
  preferredVehicle: { type: Array, required: false },
  createdBy: { type: Types.ObjectId, required: true, ref: 'User' },
  driver: { type: Types.ObjectId, required: false, ref: 'User' },
  payment: { type: Object, required: false },
});

export const Ride = model<IRide>('Ride', rideSchema);
