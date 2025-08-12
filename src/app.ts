import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import cors from 'cors';
import 'newrelic';
import timeout from 'connect-timeout';
import { haltOnTimeout } from './middleware/timeout.middleware';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { defaultTransactionData } from './models/parking_transaction_integration.model';
import { EncryptTotPOST } from './utils/encrypt.utils';
import { ERROR_MESSAGES } from './constant/INAPP.errormessage';

const app = express().disable('x-powered-by');

// const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
//   Promise.resolve(fn(req, res, next)).catch(next);

// // 🔐 Cached encrypted response to avoid high CPU usage
// let cachedEncryptedResponse: string | null = null;
// async function getCachedEncryptedResponse(key: string): Promise<string> {
//   if (!cachedEncryptedResponse) {
//     cachedEncryptedResponse = await EncryptTotPOST(
//       ERROR_MESSAGES.TOO_MANY_REQUESTS,
//       key
//     );
//   }
//   return cachedEncryptedResponse;
// }

// // 📉 Rate limiter config
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 10, // Max 10 requests per window
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: asyncHandler(async (req: Request, res: Response) => {
//     const referenceId =
//       req.headers['x-reference-id']?.toString() || 'unknown-ref';
//     const encrypted = await getCachedEncryptedResponse(referenceId);
//     return res.status(429).json({ data: encrypted }); // 429 = Too Many Requests
//   })
// });

// ✅ Apply rate limiter
// app.use(limiter);

// 🌐 Allowed CORS origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9001',
  'https://dev-occ.skyparking.online',
  'https://dev-injectmember.skyparking.online',
  'https://devtest01.skyparking.online',
  'https://sky-company-profile.vercel.app',
  'https://skyparking.co.id'
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

// ⏱️ Optional: Timeout handling
// app.use(timeout('2000ms'));
// app.use(haltOnTimeout);

// 📌 API routes
app.use('/v1', indexRoutes);

export default app;
