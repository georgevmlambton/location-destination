import express from 'express';
import { authMiddleware } from './middleware/auth';
import cors from 'cors';
const app = express();

app.use(cors());

app.use(authMiddleware);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
