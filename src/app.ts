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
const app = express().disable('x-powered-by');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:9001',
  'https://dev-occ.skyparking.online',
  'https://dev-injectmember.skyparking.online',
  'https://devtest01.skyparking.online',
  'https://sky-company-profile.vercel.app'
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
