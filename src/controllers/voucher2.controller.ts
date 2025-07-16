import { Request, Response, NextFunction } from 'express';
import { VoucherService } from '../services/voucher.service';
import { ServiceResponse } from '../interfaces/general.interface';

const voucherService = new VoucherService();

export class VoucherController {
  /**
   * POST /vouchers/inquiry
   */
  static async inquiryTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await voucherService.inquiryTicket(req.body);
      return res.status(200).json({
        status: 'SUCCESS',
        data: result
      });
    } catch (err: any) {
      return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Failed to perform inquiry'
      });
    }
  }

  /**
   * POST /vouchers/redemption
   */
  static async encryptVoucherRedemption(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await voucherService.VoucherRedemptionEncrypt(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Failed to redeem voucher'
      });
    }
  }

  static async voucherRedemption(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result: ServiceResponse = await voucherService.VoucherRedemption(
        req.body
      );

      console.log('Voucher Redemption: ', result.message);
      return res.status(result.statusCode).json({ data: result?.data });
    } catch (err: any) {
      return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Failed to redeem voucher'
      });
    }
  }

  static async encryptVoucherUsage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await voucherService.VoucherUsageEncrypt(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Failed to redeem voucher'
      });
    }
  }

  static async voucherUsageNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result: ServiceResponse =
        await voucherService.VoucherUsageNotification(req.body);

      console.log('Voucher Usage: ', result.message);
      return res.status(result.statusCode).json({ data: result?.data });
    } catch (err: any) {
      return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Failed to redeem voucher'
      });
    }
  }
}
