import express from 'express';
import { createPartnerController } from '../controllers/partner.controller';
import {
  generateSignatureSimulator,
  getAllLocationsController,
  getNearbyLocationsController
} from '../controllers/location.controller';

const partnerRoute = express.Router();

partnerRoute.post('/generate-signature', generateSignatureSimulator);
partnerRoute.post('/register-partner', createPartnerController);
partnerRoute.post('/get-alllocation', getAllLocationsController);
partnerRoute.post('/get-geolocation', getNearbyLocationsController);

export default partnerRoute;
