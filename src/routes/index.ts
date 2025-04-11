import express from 'express';
import partnerRoute from './partner.routes';
import lotRoute from './lot_management.routes';
import innAppRoute from './inapp.routes';
import healthRoute from './connection_health.routes';

const router = express.Router();

// router.use('/customer', member_customer);
// router.use('/auth', authRouter);
// router.use('/location', locationrouter);
// router.use('/product', productRouter);
// router.use('/productPurchase', purchaseProduct);
router.use('/connection', healthRoute);
router.use('/partner', partnerRoute);
router.use('/realtime', lotRoute);
router.use('/parking', innAppRoute);

export default router;
