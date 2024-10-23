import * as dotenv from 'dotenv';

dotenv.config();

export const mongoUri = process.env['MONGO_URI'] || '';
export const frontendUrl = process.env['FRONTEND_URL'] || '';
export const redisUrl = process.env['REDIS_URL'] || '';
export const mapboxToken = process.env['MAPBOX_TOKEN'] || '';
export const corsOptions = { origin: frontendUrl, methods: '*' };
