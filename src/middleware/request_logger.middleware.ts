import { Request, Response, NextFunction } from 'express';
import { lokiLogger } from '../logger/loki_logger';
import {
  RealdecryptPayload,
  RealdecryptGOPAYPayload
} from '../utils/encrypt.utils'; // adjust imports

const monitoredRoutes = [
  '/v1/parking/Partner/InquiryTariffREG',
  '/v1/parking/Partner/PaymentConfirmationREG',
  '/v1/parking/Partner/GOPAY/InquiryTransaction',
  '/v1/parking/Partner/GOPAY/PaymentConfirmation'
];

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const originalSend = res.send;

  let responseBody: any;
  (res as any).send = function (body?: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;

    let no_ticket: string | null = null;

    if (monitoredRoutes.includes(req.originalUrl)) {
      try {
        let decryptedObject: any;

        if (req.originalUrl.includes('/GOPAY/')) {
          // Use GOPAY decryption
          decryptedObject = RealdecryptGOPAYPayload(req.body);
        } else {
          // Use regular decryption
          decryptedObject = RealdecryptPayload(req.body);
        }

        no_ticket = decryptedObject?.transactionNo ?? null;
      } catch (err) {
        console.error('Failed to decrypt payload:', err);
      }
    }

    const logLine = {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip,
      no_ticket,
      request_body: JSON.stringify(req.body),
      response_body:
        typeof responseBody === 'string'
          ? responseBody
          : JSON.stringify(responseBody)
    };

    console.log(logLine);

    lokiLogger.info(JSON.stringify(logLine), {
      labels: {
        app: 'IN-APP',
        endpoint: req.originalUrl,
        status: res.statusCode.toString(),
        method: req.method
      }
    });
  });

  next();
};
