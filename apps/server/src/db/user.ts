import { Schema, model } from 'mongoose';

export interface IUser {
  uid: string;
  name?: string;
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true },
  name: { type: String, required: false },
});

export const User = model<IUser>('User', userSchema);
