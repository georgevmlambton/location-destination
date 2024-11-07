import { VehicleType } from '@location-destination/types/src/requests/profile';
import { ObjectId, Schema, model, Types } from 'mongoose';

export interface IRide {
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  preferredVehicle?: ('Electric' | 'Hybrid' | 'Gas')[];
  state: 'Searching' | 'Cancelled' | 'PickingUp' | 'Started';
  createdBy: ObjectId;
  driver?: ObjectId;
}

const rideSchema = new Schema<IRide>({
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  state: { type: String, required: true },
  passengers: { type: Number, required: true },
  preferredVehicle: { type: Array, required: false },
  createdBy: { type: Types.ObjectId, required: true, ref: 'User' },
  driver: { type: Types.ObjectId, required: false, ref: 'User' },
});

export const Ride = model<IRide>('Ride', rideSchema);
