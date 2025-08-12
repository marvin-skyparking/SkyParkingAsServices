import jwt, { SignOptions } from 'jsonwebtoken';

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

export default {
  generate: generate,
  validateToken: validateToken
};
