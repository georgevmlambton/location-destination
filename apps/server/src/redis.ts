import { createClient } from 'redis';
import * as config from './config';

export const redis = await createClient({
  url: config.redisUrl,
});
