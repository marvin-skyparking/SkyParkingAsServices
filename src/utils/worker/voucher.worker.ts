import { Worker } from 'bullmq';
import { voucherQueue, VoucherJobData } from '../queue/Voucher.queue';
import { keydbConnection } from '../../configs/keydb';
import { VoucherService } from '../../services/voucher.service';
import { acquireLock, releaseLock } from '../lock';

const service = new VoucherService();

export const voucherWorker = new Worker<VoucherJobData>(
  voucherQueue.name,
  async (job) => {
    const { type, payload } = job.data;

    switch (type) {
      case 'INQUIRY':
        return service.inquiryTicket(payload);

      case 'REDEMPTION': {
        const lockKey = `lock:redeem:${payload.transactionNo}`;
        const gotLock = await acquireLock(lockKey, 30_000);

        if (!gotLock) {
          // Another worker has the same transaction; retry later.
          // Throwing lets BullMQ re‑queue the job according to `attempts` and `backoff`.
          throw new Error(
            `Duplicate redemption in‐flight for ${payload.transactionNo}`
          );
        }

        try {
          return await service.VoucherRedemption(payload);
        } finally {
          await releaseLock(lockKey);
        }
      }

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  { connection: keydbConnection, concurrency: 5 }
);

// Optional: simple log hooks
voucherWorker.on('completed', (job) =>
  console.info('[✔︎] job %s done', job.id)
);
voucherWorker.on('failed', (job, err) =>
  console.error('[✘] job %s failed: %s', job?.id, err)
);
voucherWorker.on('progress', (job, p) =>
  console.debug('[…] job %s %j', job.id, p)
);
