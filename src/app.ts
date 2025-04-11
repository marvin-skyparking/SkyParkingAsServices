import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler
} from 'express';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import cors from 'cors';
import timeout from 'connect-timeout'; // ✅ Make sure this is imported

const app = express().disable('x-powered-by');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9001',
  'https://dev-occ.skyparking.online',
  'https://dev-injectmember.skyparking.online'
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

// Handling Timeout
app.use(timeout('30s'));
app.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as any).timedout) return;
  next();
});

//Routes Flow
app.use('/v1', indexRoutes);

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err?.timeout && !res.headersSent) {
    console.warn('Timeout error caught:', err.message);
    return res.status(200).json({
      responseStatus: 'Failed',
      responseCode: '211002',
      responseDescription: 'Request timed out',
      messageDetail: 'Connection to the API Timeout'
    });
  }

  if (!res.headersSent) {
    return res.status(200).json({
      responseStatus: 'Failed',
      responseCode: '500500',
      message: 'General server error'
    });
  }

  next();
};

app.use(errorHandler);

export default app;
