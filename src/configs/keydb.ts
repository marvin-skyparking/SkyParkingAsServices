import { RedisOptions } from 'ioredis';

/**
 * Single place where you describe how to reach KeyDB.
 * You can load these from env vars if you prefer.
 */
export const keydbConnection: RedisOptions = {
  host: process.env.KEYDB_HOST ?? '127.0.0.1',
  port: +(process.env.KEYDB_PORT ?? 6379),
  username: process.env.KEYDB_USERNAME,
  password: process.env.KEYDB_PASSWORD,
  tls: process.env.KEYDB_TLS === 'true' ? {} : undefined
};
