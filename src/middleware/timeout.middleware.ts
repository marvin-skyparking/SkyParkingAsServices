import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export function haltOnTimeout(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).timedout) next();
}

export async function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
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
      responseCode: '500501',
      message: 'General server error'
    });
  }

  next();
}
