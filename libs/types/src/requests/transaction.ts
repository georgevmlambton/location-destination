import { RideResponse } from './ride';

export type MakePaymentResponse = {
  redirectUrl: string;
};

export type TransactionResponse = {
  id: string;
  createdAt: Date;
  amount: number;
  type: 'credit' | 'debit';
  ride?: RideResponse;
  paymentId?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
};

export type TransactionsResponse = {
  transactions: TransactionResponse[];
};
