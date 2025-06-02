import { Request, Response, NextFunction } from 'express';
import { RealencryptPayload } from '../utils/encrypt.utils';

export async function haltOnTimeout(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  // Handle timeout
  if (err?.timeout && !res.headersSent) {
    console.warn('Timeout error caught:', err.message);
    return res.status(200).json(
      RealencryptPayload({
        responseStatus: 'Failed',
        responseCode: '211051',
        responseDescription: 'Request timed out',
        messageDetail: 'Connection to the API Timeout'
      })
    );
  }

  next(err);
}
