import express from 'express';
import {
  getLocationByCodeController,
  updateLot
} from '../controllers/realtime_location.controller';
import { getInArea } from '../controllers/location.controller';

const lotRoute = express.Router();

lotRoute.post('/update-lot', updateLot);
lotRoute.get('/location/:location_code', getLocationByCodeController);
lotRoute.get('/location-realtime', getInArea);

export default lotRoute;
