import { Queue } from 'bullmq';
import { keydbConnection } from '../../configs/keydb';

export interface VoucherJobData {
  type: 'INQUIRY' | 'REDEMPTION';
  payload: any; // the DTO you pass through
}

/**
 * One queue for everything voucher‑related.
 * Named queues become KeyDB streams under the hood (`bull:VoucherQueue:*`)
 */
export const voucherQueue = new Queue<VoucherJobData>('VoucherQueue', {
  connection: keydbConnection,
  defaultJobOptions: {
    // avoid accidental duplicates for the *same* transaction in a short window
    removeOnComplete: 1000,
    removeOnFail: 1000,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 }
  }
});
