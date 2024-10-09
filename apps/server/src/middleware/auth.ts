import { NextFunction, Request, Response } from 'express';
import * as firebase from '../firebase';

export async function authMiddleware(
  req: Request,
  resp: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth) {
    return resp.status(401).send('Unauthorized');
  }

  const token = auth.split('Bearer ')[1];

  if (!token) {
    return resp.status(401).send('Unauthorized');
  }

  try {
    await firebase.auth.verifyIdToken(token);
    next();
  } catch (e) {
    console.error(e);
    return resp.status(401).send('Unauthorized');
  }
}
