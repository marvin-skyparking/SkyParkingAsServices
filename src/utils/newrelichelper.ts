// newrelicHelper.ts
import newrelic from 'newrelic';
import { Request } from 'express';

export function logNewRelicEvent(
  eventName: string,
  req: Request,
  context: {
    stage?: string;
    requestBody?: any;
    responseBody?: any;
    extra?: Record<string, any>;
  } = {}
) {
  const timestamp = new Date().toISOString();

  newrelic.recordCustomEvent(eventName, {
    stage: context.stage ?? eventName,
    timestamp,
    requestBody: context.requestBody ?? '',
    responseBody: context.responseBody ?? '',
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    ...context.extra
  });
}
