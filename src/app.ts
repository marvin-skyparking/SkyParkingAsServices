import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler
} from 'express';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import cors from 'cors';
import timeout from 'connect-timeout';
import { haltOnTimeout } from './middleware/timeout.middleware';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { defaultTransactionData } from './models/parking_transaction_integration.model';
import { EncryptTotPOST } from './utils/encrypt.utils';
import { ERROR_MESSAGES } from './constant/INAPP.errormessage';
const app = express().disable('x-powered-by');

// ✅ Rate limiter config (e.g. 100 requests per 15 minutes per IP)

// Async helper wrapper for Express-compatible middleware
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Your encryptAndRespond function (placed above limiter if in same file)
const encryptAndRespond = async (
  req: any,
  res: any,
  payload: any,
  key: string,
  transactionNo?: string
) => {
  const encrypted = await EncryptTotPOST(payload, key);
  return res.status(429).json({ data: encrypted }); // 429 for rate limiting
};

// Apply rate limiter with async handler
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const referenceId =
        req.headers['x-reference-id']?.toString() || 'unknown-ref';

      await encryptAndRespond(
        req,
        res,
        ERROR_MESSAGES.TOO_MANY_REQUESTS,
        referenceId
      );
    }
  )
});

// ✅ Apply rate limiting globally
app.use(limiter);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9001',
  'https://dev-occ.skyparking.online',
  'https://dev-injectmember.skyparking.online',
  'https://devtest01.skyparking.online',
  'https://sky-company-profile.vercel.app',
  'https://skyparking.co.id'
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, success?: boolean) => void
  ) => {
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, '../public')));

// // Handling Timeout
// app.use(timeout('2000ms'));
//Routes Flow
app.use('/v1', indexRoutes);
// app.use(haltOnTimeout);

export default app;
