import { ObjectId, Schema, model, Types } from 'mongoose';

export interface IRide {
  pickupAddress: string;
  dropoffAddress: string;
  state: 'Searching' | 'Cancelled';
  createdBy: ObjectId;
}

const rideSchema = new Schema<IRide>({
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  state: { type: String, required: true },
  createdBy: { type: Types.ObjectId, required: true, ref: 'User' },
});

export const Ride = model<IRide>('Ride', rideSchema);
