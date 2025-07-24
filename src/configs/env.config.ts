import dotenv from 'dotenv';
import { IEnvInterface } from '../interfaces/env.interface';

dotenv.config();

const ENV: any = process.env;
const EnvConfig: IEnvInterface = ENV;

// if (EnvConfig.NODE_ENV !== 'production') {
//   EnvConfig.SENTRY_ENABLE = false;
//   EnvConfig.ENABLE_CLUSTER = false;
//   EnvConfig.APP_CORES = 1;
// }

if (EnvConfig.NODE_ENV === 'development') {
  EnvConfig.APP_URL = EnvConfig.APP_URL;
  EnvConfig.DB_NAME_DEV = EnvConfig.DB_NAME_DEV;
  EnvConfig.ENABLE_SWAGGER = EnvConfig.ENABLE_SWAGGER;
  EnvConfig.PORT = EnvConfig.PORT;
  EnvConfig.USERNAME_DB_DEV = EnvConfig.USERNAME_DB_DEV;
  EnvConfig.PASSWORD_DB_DEV = EnvConfig.PASSWORD_DB_DEV;
  EnvConfig.SENTRY_URI = EnvConfig.SENTRY_URI;
  EnvConfig.SENTRY_ENABLE = EnvConfig.SENTRY_ENABLE;
  EnvConfig.JWT_SECRET = EnvConfig.JWT_SECRET;
  EnvConfig.PAYMENT_APP = EnvConfig.PAYMENT_APP;
  EnvConfig.URL_TOKEN = EnvConfig.URL_TOKEN;
  EnvConfig.URL_AUTO_ENTRY = EnvConfig.URL_AUTO_ENTRY;
}

if (EnvConfig.NODE_ENV === 'production') {
  EnvConfig.APP_URL = EnvConfig.APP_URL;
  EnvConfig.DB_NAME_PROD = EnvConfig.DB_NAME_PROD;
  EnvConfig.PORT = EnvConfig.PORT;
  EnvConfig.USERNAME_DB_PROD = EnvConfig.USERNAME_DB_PROD;
  EnvConfig.PASSWORD_DB_PROD = EnvConfig.PASSWORD_DB_PROD;
  EnvConfig.DB_NAME_PROD_UNIKAS = EnvConfig.DB_NAME_PROD_UNIKAS;
  EnvConfig.PAYMENT_APP = EnvConfig.PAYMENT_APP;
  EnvConfig.URL_TOKEN = EnvConfig.URL_TOKEN;
  EnvConfig.URL_AUTO_ENTRY = EnvConfig.URL_AUTO_ENTRY;
}
export default EnvConfig;
