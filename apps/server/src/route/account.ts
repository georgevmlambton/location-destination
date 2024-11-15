import { Request, Response, Router } from 'express';
import { Account } from '../db/account';
import { User } from '../db/user';
import { AccountResponse } from '@location-destination/types/src/requests/account';

export const accountRouter = Router();

accountRouter.get('/api/account', async (req: Request, resp: Response) => {
  const user = await User.findOne({ uid: req.user.uid });

  if (!user) {
    return resp.status(401).send('Unauthorized');
  }

  const account = await Account.findOne({ user: user.id });

  const response: AccountResponse = {
    userId: user.id,
    amount: account?.amount ?? 0,
  };

  resp.send(response);
});
