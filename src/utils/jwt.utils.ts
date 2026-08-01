import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import envConfig from '../configs/env.config';
import loggerUtils from './logger.utils';

export const generate = async (payload: any, exp?: any) => {
  try {
    delete payload?.password;
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: exp ?? '30d'
    });

    // const refresh_token = jwt.sign(payload, envConfig.JWT_SECRET, {expiresIn: '1y'})
    return {
      token: `Bearer ${token}`
      // refresh_token: `Bearer ${refresh_token}`
    };
  } catch (error: any) {
    loggerUtils.error(error, error?.message);
    throw new Error(error?.message);
  }
};

export const validateToken = async (token: any): Promise<any> => {
  try {
    const verify = jwt.verify(token, envConfig.JWT_SECRET);
    return verify;
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

// Generate an access token for clientId with JWT_SECRET_NOBU
export function generateAccessToken(
  clientId: string,
  secret_key: string
): string {
  const claims = {
    Id: clientId, // Client ID sent in the request
    jti: jwt.sign({}, secret_key) // Unique identifier for the token
  };

  const expiresIn = '1440m'; // Token expiration time (24 hours)

  // Generate and return the JWT token for clientId
  return jwt.sign(claims, secret_key, {
    algorithm: 'HS256', // HMAC SHA-256
    expiresIn
  } as SignOptions); // Use SignOptions for type safety
}

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        responseCode: '401001',
        responseMessage: 'Authorization header is required'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        responseCode: '401002',
        responseMessage: 'Invalid Authorization format'
      });
    }

    const token = authHeader.substring(7);

    console.log('JWT_SECRET:', envConfig.JWT_SECRET);
    console.log('TOKEN:', token);

    const decoded = jwt.verify(token, envConfig.JWT_SECRET);

    console.log('DECODED:', decoded);

    (req as any).user = decoded;

    return next();
  } catch (err: any) {
    console.error(err);

    return res.status(401).json({
      responseCode: '401003',
      responseMessage: err.message,
      errorName: err.name
    });
  }
}
export default {
  generate: generate,
  validateToken: validateToken
};
