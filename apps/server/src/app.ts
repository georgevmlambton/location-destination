import express from 'express';
import { authMiddleware } from './middleware/auth';
import cors from 'cors';
import { healthRouter } from './route/health';
import bodyParser from 'body-parser';
import { profileRouter } from './route/profile';
import * as config from './config';
import { createServer } from 'http';
import { rideRouter } from './route/ride';
import { accountRouter } from './route/account';
import { transactionRouter } from './route/transaction';
import { createReadStream } from 'fs';
const app = express();

app.use(cors(config.corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(
  '/api',
  authMiddleware,
  healthRouter,
  profileRouter,
  rideRouter,
  transactionRouter,
  accountRouter,
  (req, resp) => {
    resp.status(404).send(`No handler for route /api${req.path} found`);
  }
);

app.use(express.static('public', { extensions: ['html', 'htm'] }));

app.use((req, resp) => {
  try {
    resp.header('Content-Type', 'text/html; charset=utf-8');
    createReadStream('public/index.html').pipe(resp);
  } catch (_) {
    resp.status(404).send('Not Found');
  }
});

export const server = createServer(app);

export default app;
