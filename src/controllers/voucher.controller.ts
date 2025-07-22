import { Request, Response, NextFunction } from 'express';
import { voucherQueue } from '../utils/queue/Voucher.queue';

export class VoucherController {
  /**
   * POST /vouchers/inquiry
   */
  static async inquiryTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await voucherQueue.add('inquiry', {
        type: 'INQUIRY',
        payload: req.body
      });

      return res.status(202).json({
        status: 'QUEUED',
        jobId: job.id
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /vouchers/redemption
   */
  static async voucherRedemption(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const job = await voucherQueue.add(
        'redemption',
        {
          type: 'REDEMPTION',
          payload: req.body
        },
        {
          jobId: `redeem:${req.body.transactionNo}`
        }
      );

      return res.status(202).json({
        status: 'QUEUED',
        jobId: job.id
      });
    } catch (err) {
      next(err);
    }
  }
}
