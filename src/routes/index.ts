import { Router } from 'express';
import express from 'express';

// router.use('/customer', member_customer);
// router.use('/auth', authRouter);
// router.use('/location', locationrouter);
// router.use('/product', productRouter);
// router.use('/productPurchase', purchaseProduct);
import partnerRoute from './partner.routes';
import lotRoute from './lot_management.routes';
import innAppRoute from './inapp.routes';
import healthRoute from './connection_health.routes';

const router: Router = express.Router();

router.use('/connection', healthRoute);
router.use('/partner', partnerRoute);
router.use('/realtime', lotRoute);
router.use('/parking', innAppRoute);

const typedRouter: Router = router;
export default typedRouter;
