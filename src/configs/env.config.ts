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
  EnvConfig.APP_URL = EnvConfig.APP_URL ?? 'http://localhost:9000';
  EnvConfig.DB_DEV = EnvConfig.DB_DEV ?? 'db_skyccc';
  EnvConfig.ENABLE_SWAGGER = EnvConfig.ENABLE_SWAGGER ?? true;
  EnvConfig.PORT = EnvConfig.PORT ?? 9000;
  EnvConfig.USERNAME_DB_DEV = EnvConfig.USERNAME_DB_DEV ?? 'root';
  EnvConfig.PASSWORD_DB_DEV = EnvConfig.PASSWORD_DB_DEV ?? '50p4y5ky0v0!';
  EnvConfig.SENTRY_URI = EnvConfig.SENTRY_URI ?? '';
  EnvConfig.SENTRY_ENABLE = EnvConfig.SENTRY_ENABLE ?? false;
  EnvConfig.JWT_SECRET = EnvConfig.JWT_SECRET ?? 'skyparking';
  EnvConfig.BAYARIND_DEV_URL ?? 'https://snaptest.bayarind.id';
  EnvConfig.PAYMENT_SERVICE_URL ??
    'https://apipaymentservice.skyparking.online';
  EnvConfig.FONTE_ENDPOINT = EnvConfig.FONTE_ENDPOINT;
  EnvConfig.FONTE_TOKEN = EnvConfig.FONTE_TOKEN;
}
export default EnvConfig;
