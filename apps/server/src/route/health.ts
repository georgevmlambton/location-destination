import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/api/', (req, res) => {
  res.send('Hello World!');
});
