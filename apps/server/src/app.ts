import express from 'express';
import { authMiddleware } from './middleware/auth';
import cors from 'cors';
import { healthRouter } from './route/health';
import bodyParser from 'body-parser';
import { profileRouter } from './route/profile';
const app = express();

app.use(cors());

app.use(authMiddleware);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(healthRouter);

app.use(profileRouter);

export default app;
