import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CaptureRequest } from './common.response';

export async function NotFoundHandler(
  req: Request,
  res: Response
): Promise<void> {
  const captureReq = await CaptureRequest(req);
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found!',
    error: captureReq
  });
}
