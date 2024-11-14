import { Request, Response, Router } from 'express';
import { IUser, User } from '../db/user';
import { Transaction } from '../db/transaction';
import { IRide } from '../db/ride';
import { Types } from 'mongoose';
import { createRideResponse } from './ride';
import { TransactionsResponse } from '@location-destination/types/src/requests/transaction';

export const transactionRouter = Router();

transactionRouter.get(
  '/api/account/transactions',
  async (req: Request, resp: Response) => {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return resp.status(401).send('Unauthorized');
    }

    const transactions = await Transaction.find({ user: user.id }).populate<{
      ride: Omit<IRide, 'createdBy' | 'driver'> & {
        _id: Types.ObjectId;
        createdBy: IUser;
        driver?: IUser;
      };
    }>({
      path: 'ride',
      populate: [
        {
          path: 'createdBy',
        },
        {
          path: 'driver',
        },
      ],
    });

    const response: TransactionsResponse = {
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        createdAt: transaction.createdAt,
        amount: transaction.amount,
        type: transaction.type,
        ride: transaction.ride
          ? createRideResponse(transaction.ride)
          : undefined,
        paymentId: transaction.paymentId,
        paymentStatus: transaction.paymentStatus,
      })),
    };

    resp.send(response);
  }
);
