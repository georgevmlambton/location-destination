import { Schema, model } from 'mongoose';

export interface IUser {
  uid: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
    capacity?: number;
  };
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true },
  name: { type: String, required: false },
  type: { type: String, required: false },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    color: String,
    licensePlate: String,
    capacity: Number,
  },
});

export const User = model<IUser>('User', userSchema);
