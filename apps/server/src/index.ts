import app from './app';
import mongoose from 'mongoose';
import { mongoUri } from './config';
const port = 8080;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

await mongoose.connect(mongoUri);

console.log('Connected to MongoDB');
