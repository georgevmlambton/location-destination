import { Request, Response, Router } from 'express';
import { IUser, User } from '../db/user';
import { ITransaction, Transaction } from '../db/transaction';
import { IRide } from '../db/ride';
import { Types } from 'mongoose';
import { createRideResponse } from './ride';
import {
  MakePaymentResponse,
  TransactionsResponse,
} from '@location-destination/types/src/requests/transaction';
import { Stripe } from 'stripe';
import * as config from '../config';
import { Account } from '../db/account';

const stripe = new Stripe(config.stripeKey);

export const transactionRouter = Router();

transactionRouter.get(
  '/account/transactions',
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
      transactions: transactions
        .filter((t) => t.paymentStatus != 'Unpaid')
        .map(createTransactionResponse),
    };

    resp.send(response);
  }
);

transactionRouter.post('/account/pay', async (req: Request, resp: Response) => {
  const user = await User.findOne({ uid: req.user.uid }).orFail();
  const account = await Account.findOne({ user: user.id });
  const balance = account?.amount ?? 0;

  if (balance >= 0) {
    return resp.status(400).send({
      message: "You don't have an outstanding negative balance to clear",
    });
  }

  const transaction = await new Transaction({
    createdAt: new Date(),
    user: user.id,
    amount: Math.abs(balance),
    type: 'credit',
    paymentStatus: 'Unpaid',
  }).save();

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'CAD',
          unit_amount: transaction.amount,
          product_data: {
            name: 'Clear balance',
            description: 'Payment to clear account balance',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.frontendUrl}/payment/success?transactionId=${transaction.id}`,
    cancel_url: `${config.frontendUrl}/payment/failed`,
  });

  if (!session.url) {
    resp.status(500).send({ message: 'Failed to redirect' });
    return;
  }

  transaction.paymentId = session.id;
  await transaction.save();

  const response: MakePaymentResponse = {
    redirectUrl: session.url,
  };

  resp.send(response);
});

transactionRouter.get(
  '/account/transactions/:transactionId',
  async (req: Request, resp: Response) => {
    const transactionId = req.params.transactionId;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return resp.status(404).send({ message: 'Transaction not found' });
    }

    if (!transaction.paymentId) {
      return resp.status(404).send({ message: 'Not a payment' });
    }

    if (transaction.paymentStatus !== 'Paid') {
      const session = await stripe.checkout.sessions.retrieve(
        transaction.paymentId
      );

      if (session.payment_status !== 'unpaid') {
        transaction.paymentStatus = 'Paid';
        await Account.updateOne(
          { user: transaction.user },
          { $inc: { amount: transaction.amount } }
        );
        await transaction.save();
      }
    }

    return resp.send({
      id: transaction._id.toString(),
      createdAt: transaction.createdAt,
      amount: transaction.amount,
      type: transaction.type,
      paymentId: transaction.paymentId,
      paymentStatus: transaction.paymentStatus,
    });
  }
);

function createTransactionResponse(
  transaction: Omit<ITransaction, 'ride'> & {
    _id: Types.ObjectId;
    ride?: Omit<IRide, 'createdBy' | 'driver'> & {
      _id: Types.ObjectId;
      createdBy: IUser;
      driver?: IUser;
    };
  }
) {
  return {
    id: transaction._id.toString(),
    createdAt: transaction.createdAt,
    amount: transaction.amount,
    type: transaction.type,
    ride: transaction.ride ? createRideResponse(transaction.ride) : undefined,
    paymentId: transaction.paymentId,
    paymentStatus: transaction.paymentStatus,
  };
}
