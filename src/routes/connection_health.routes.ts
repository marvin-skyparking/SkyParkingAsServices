import express from 'express';
import { healthCheckController } from '../controllers/health_controller';

const healthRoute = express.Router();

healthRoute.get('/check-health', healthCheckController);

export default healthRoute;
