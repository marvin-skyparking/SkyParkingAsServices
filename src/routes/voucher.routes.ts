import { Router } from 'express';
import { VoucherController } from '../controllers/voucher2.controller';
import { VOUCHER_INQUIRY_TICKET_LIPPO_MALLS } from '../controllers/transaction.controller';

const router = Router();

router.post(
  '/parking/Voucher/InquiryTicket',
  VOUCHER_INQUIRY_TICKET_LIPPO_MALLS
);
router.post('/generate-redemption', VoucherController.encryptVoucherRedemption);
router.post(
  '/parking/Voucher/VoucherRedemption',
  VoucherController.voucherRedemption
);
router.post('/generate-usage', VoucherController.encryptVoucherUsage);
router.post(
  '/parking/Voucher/VoucherUsageNotification',
  VoucherController.voucherUsageNotification
);
router.post('/simulator-usage', VoucherController.SimulatorVoucherUsage);

export default router;
