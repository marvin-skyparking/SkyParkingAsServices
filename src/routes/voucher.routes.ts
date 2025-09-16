import { Router } from 'express';
import { VoucherController } from '../controllers/voucher2.controller';
import { SendVoucherToLMI } from '../controllers/transaction.controller';

const router = Router();

router.post('/inquiry', VoucherController.inquiryTicket);
router.post('/generate-redemption', VoucherController.encryptVoucherRedemption);
router.post('/redemption', VoucherController.voucherRedemption);
router.post('/generate-usage', VoucherController.encryptVoucherUsage);
router.post('/usage-notification', VoucherController.voucherUsageNotification);

router.post('/manualsendLMI', SendVoucherToLMI);

export default router;
