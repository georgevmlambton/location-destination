import { NextFunction, Request, Response } from 'express';
import * as firebase from '../firebase';
import { ExtendedError } from 'socket.io';
import { Socket } from '../types/socket';

export async function authMiddleware(
  req: Request,
  resp: Response,
  next: NextFunction
) {
  try {
    const user = await getUser(req.headers.authorization);
    req.user = user;
    next();
  } catch (e) {
    return resp.status(401).send(e.message);
  }
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    const user = await getUser(socket.request.headers.authorization);
    socket.data = { user };
    next();
  } catch (e) {
    next(e);
  }
}

async function getUser(auth: string | undefined) {
  if (!auth) {
    throw new Error('Unauthorized');
  }

  const token = auth.split('Bearer ')[1];

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const user = await firebase.auth.verifyIdToken(token);
    return user;
  } catch (e) {
    console.error(e.message);
    throw new Error('Unauthorized');
  }
}
