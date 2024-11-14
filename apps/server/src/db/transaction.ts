import { ObjectId, Schema, model, Types } from 'mongoose';

export interface ITransaction {
  createdAt: Date;
  user: ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  ride?: ObjectId;
  paymentId?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
}

const transactionSchema = new Schema<ITransaction>({
  createdAt: { type: Date, required: true },
  user: { type: Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  ride: { type: Types.ObjectId, required: false, ref: 'Ride' },
  paymentId: { type: String, required: false },
  paymentStatus: { type: String, required: false },
});

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema
);
