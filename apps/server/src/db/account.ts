import { ObjectId, Schema, model, Types } from 'mongoose';

export interface IAccount {
  user: ObjectId;
  amount: number;
}

const accountSchema = new Schema<IAccount>({
  user: { type: Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
});

export const Account = model<IAccount>('Account', accountSchema);
