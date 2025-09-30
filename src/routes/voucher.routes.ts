import { Router } from 'express';
import { VoucherController } from '../controllers/voucher2.controller';
import { VOUCHER_INQUIRY_TICKET_LIPPO_MALLS } from '../controllers/transaction.controller';

const router = Router();

router.post('/inquiry-ticket', VOUCHER_INQUIRY_TICKET_LIPPO_MALLS);
router.post('/generate-redemption', VoucherController.encryptVoucherRedemption);
router.post('/redemption', VoucherController.voucherRedemption);
router.post('/generate-usage', VoucherController.encryptVoucherUsage);
router.post('/usage-notification', VoucherController.voucherUsageNotification);
router.post('/simulator-usage', VoucherController.SimulatorVoucherUsage);

export default router;
