import { Schema, model } from 'mongoose';

export interface IUser {
  uid: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  preferredVehicle?: ('Electric' | 'Hybrid' | 'Gas')[];
  photoUrl?: string | null;
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true },
  name: { type: String, required: false },
  type: { type: String, required: false },
  preferredVehicle: { type: Array, required: false },
  photoUrl: { type: String, required: false },
});

export const User = model<IUser>('User', userSchema);
