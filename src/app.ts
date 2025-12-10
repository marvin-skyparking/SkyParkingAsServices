import 'newrelic';
import express from 'express';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import cors from 'cors';
import path from 'path';

import { metricsMiddleware, metricsRouter } from './middleware/metrics_middleware';
import { requestLogger } from './middleware/request_logger.middleware';



const app = express().disable('x-powered-by');
app.use(requestLogger);   

// 🌐 Allowed CORS origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9090',
  'http://localhost:9001',
];

// 🛡️ CORS setup
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, success?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));

// 📦 Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🗂️ Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, '../public')));


// 📌 API routes
app.use('/v1', indexRoutes);

// 📊 Add Prometheus metrics before all routes

app.use(metricsMiddleware);
app.use('/metrics', metricsRouter);

export default app;
