import { RideResponse } from './ride';

export type TransactionsResponse = {
  transactions: {
    id: string;
    createdAt: Date;
    amount: number;
    type: 'credit' | 'debit';
    ride?: RideResponse;
    paymentId?: string;
    paymentStatus?: 'Unpaid' | 'Paid';
  }[];
};
