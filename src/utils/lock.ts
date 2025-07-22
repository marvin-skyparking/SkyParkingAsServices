import IORedis from 'ioredis';
import { keydbConnection } from '../configs/keydb';

const redis = new IORedis(keydbConnection);

/**
 * Try to grab a lock; return true if obtained.
 * TTL is in milliseconds.
 */
export async function acquireLock(key: string, ttl = 30_000): Promise<boolean> {
  // PX comes first (duration mode), NX comes last (set‑mode)
  const ok = await redis.set(key, Date.now().toString(), 'PX', ttl, 'NX');
  return ok === 'OK';
}

export async function releaseLock(key: string): Promise<void> {
  await redis.del(key).catch(() => void 0);
}
