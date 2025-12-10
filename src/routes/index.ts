import express from 'express';
import partnerRoute from './partner.routes';
import lotRoute from './lot_management.routes';
import innAppRoute from './inapp.routes';
import healthRoute from './connection_health.routes';
import voucherRoute from './voucher.routes';

const router = express.Router();

router.use('/realtime', lotRoute);
router.use('/parking', innAppRoute);
router.use('/vouchers', voucherRoute);

export default router;
