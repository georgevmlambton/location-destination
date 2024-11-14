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
const app = express();

app.use(cors(config.corsOptions));

app.use(authMiddleware);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(healthRouter);

app.use(profileRouter);

app.use(rideRouter);

app.use(transactionRouter);

app.use(accountRouter);

export const server = createServer(app);

export default app;
