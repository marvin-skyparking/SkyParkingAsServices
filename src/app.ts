import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import cors from 'cors';

// Initialize express app
const app = express().disable('x-powered-by');

// CORS options to allow requests from localhost:9000
const allowedOrigins = ['http://localhost:3000', 'http://localhost:9001'];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, success?: boolean) => void
  ) => {
    // Check if the origin is in the allowed origins list or if it's undefined (for non-browser requests)
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Deny the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
  // Removed allowedHeaders
};

app.use(cors(corsOptions)); // Use the defined CORS options
app.use(express.json());

// Initialize Swagger
// const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

// if (enableSwagger) {
//   // Serve Swagger API documentation
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// }

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User routes (Example)
app.use('/v1', indexRoutes);

export default app;
