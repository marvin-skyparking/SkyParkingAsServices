import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// =========================
// 1. DEFAULT METRICS
// =========================
client.collectDefaultMetrics({
  prefix: 'INAPP_BACKEND_'
});

// =========================
// 2. COUNTER - TOTAL REQUESTS
// =========================
export const httpRequestCounter = new client.Counter({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// =========================
// 3. HISTOGRAM - LATENCY
// =========================
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status'],
  buckets: [50, 100, 300, 500, 1000, 3000, 5000]
});

// =========================
// 4. GAUGE - HEALTH CHECK
// =========================
export const healthGauge = new client.Gauge({
  name: 'service_health_score',
  help: 'Health score from 0-100'
});

// Set default value (100%)
healthGauge.set(100);

// =========================
// 5. GAUGE - REQUEST LOAD (RPS LEVEL)
// =========================
export const requestLoadGauge = new client.Gauge({
  name: 'request_load_level',
  help: 'Traffic load level for coloring'
});

// Level:
// 1-2000   = 1 (green)
// 2001-6000 = 2 (yellow)
// 6001-10000 = 3 (orange)
// 10001+ = 4 (red)

let requestCountMinute = 0;

setInterval(() => {
  const perMinute = requestCountMinute;

  if (perMinute <= 2000) requestLoadGauge.set(1);
  else if (perMinute <= 6000) requestLoadGauge.set(2);
  else if (perMinute <= 10000) requestLoadGauge.set(3);
  else requestLoadGauge.set(4);

  requestCountMinute = 0;
}, 60_000);

// =========================
// 6. MIDDLEWARE
// =========================
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  requestCountMinute++;

  res.on('finish', () => {
    const duration = Date.now() - start;

    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode
      },
      duration
    );
  });

  next();
};

// =========================
// 7. METRICS ROUTER
// =========================
export const metricsRouter = async (req: Request, res: Response) => {
  try {
    const metrics = await client.register.metrics();
    res.setHeader('Content-Type', client.register.contentType);
    res.end(metrics);
  } catch (err) {
    res.status(500).send('Error generating metrics');
  }
};
