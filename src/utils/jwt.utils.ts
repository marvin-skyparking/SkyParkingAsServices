import jwt from 'jsonwebtoken';

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

export default {
  generate: generate,
  validateToken: validateToken
};
