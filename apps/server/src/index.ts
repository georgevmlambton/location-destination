import { server } from './app';
import mongoose from 'mongoose';
import { mongoUri } from './config';
import { initializeSocket } from './socket';
import { redis } from './redis';

const port = 8080;

console.log('\nStarting server...');
await new Promise<void>((resolve, reject) =>
  server.listen(port, resolve).on('error', reject)
);
console.log(`Server listening on http://localhost:${port}\n`);

console.log('Connecting to MongoDB...');
await mongoose.connect(mongoUri);
console.log('Connected to MongoDB\n');

console.log('Connecting to Redis...');
await redis.connect();
console.log('Connected to Redis\n');

console.log('Starting Socket.io...');
initializeSocket(server);
console.log('Socket.io started\n');
