import express from 'express';
import { updateLot } from '../controllers/realtime_location.controller';

const lotRoute = express.Router();

lotRoute.post('/update-lot', updateLot);

export default lotRoute;
