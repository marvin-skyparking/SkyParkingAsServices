import express from 'express';
import {
  getLocationByCodeController,
  updateLot
} from '../controllers/realtime_location.controller';
import { getInArea } from '../controllers/location.controller';
import { verifyClientAuth } from '../middleware/verify_auth.middleware';

const lotRoute = express.Router();

lotRoute.post('/update-lot', verifyClientAuth, updateLot);
lotRoute.get('/location/:location_code', getLocationByCodeController);
lotRoute.get('/location-realtime', getInArea);

export default lotRoute;
