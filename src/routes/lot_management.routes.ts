import express from 'express';
import { getLocationByCodeController, updateLot } from '../controllers/realtime_location.controller';

const lotRoute = express.Router();

lotRoute.post('/update-lot', updateLot);
lotRoute.get('/location',getLocationByCodeController)


export default lotRoute;
