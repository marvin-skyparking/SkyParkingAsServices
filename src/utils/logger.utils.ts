import envConfig from '../configs/env.config';
import sentryUtils from './sentry.utils';

const SENTRY_LOGGING = envConfig.SENTRY_ENABLE;

const log = async (message: any) => {
  message = `[\x1b[32mLOG\x1b[0m] ${message}`;
  console.log(message);
};

const info = async (message: any) => {
  message = `[\x1b[36mINFO\x1b[0m] ${message}`;
  console.log(message);
};

const error = async (error: any, message: string) => {
  message = `[\x1b[31mERROR\x1b[0m] ${message}`;
  console.log(message);
  console.log(error);
  if (SENTRY_LOGGING) {
    await sentryUtils.send(error);
  }
};

const warn = async (message: any) => {
  message = `[\x1b[33mWARN\x1b[0m] ${message}`;
  console.log(message);
};

const debug = async (message: string, data: any) => {
  message = `[\x1b[35mDEBUG\x1b[0m] ${message}`;
  console.log(message);
  console.log(data);
};

export default {
  log: log,
  info: info,
  error: error,
  warn: warn,
  debug: debug
};
