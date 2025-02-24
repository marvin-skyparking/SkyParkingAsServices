import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import envConfig from '../../configs/env.config';
import loggerUtils from '../logger.utils';

export async function CaptureRequest(req: Request) {
  return {
    path: req.originalUrl,
    method: req.method,
    query: req.query,
    params: req.params,
    headers: req.headers,
    body: req.body
  };
}

export async function OK(
  res: Response,
  message: string,
  data?: any,
  meta?: any
) {
  return res.status(StatusCodes.OK).json({
    status: true,
    message: message,
    data: data,
    meta: meta
  });
}

export async function NotFound(res: Response, message: string, data?: any) {
  return res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: message,
    data: data
  });
}

export async function BadRequest(res: Response, message: string, data?: any) {
  return res.status(StatusCodes.BAD_REQUEST).json({
    status: false,
    message: message,
    data: data
  });
}

export async function ServerError(
  req: Request,
  res: Response,
  message: string,
  data?: any
) {
  const captureRequest = await CaptureRequest(req);
  loggerUtils.error(message, data);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: false,
    message: message,
    data: envConfig.NODE_ENV == 'production' ? null : data,
    ...(envConfig.NODE_ENV == 'production' && {
      error: captureRequest
    })
  });
}

export async function Unauthorized(res: Response, message?: string) {
  message = message ?? 'Unauthorized!';
  return res.status(StatusCodes.UNAUTHORIZED).json({
    status: false,
    message: message
  });
}

export async function Forbidden(res: Response, message: string) {
  return res.status(StatusCodes.FORBIDDEN).json({
    status: false,
    message: message
  });
}

export async function TooManyRequest(res: Response) {
  return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
    status: false,
    message: 'too many request!'
  });
}
