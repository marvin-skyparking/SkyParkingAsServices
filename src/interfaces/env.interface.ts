export interface IEnvInterface {
  NODE_ENV: string;
  APP_URL: string;
  PORT: string;
  HOST_DB_PROD: string;
  HOST_DB_DEV: string;
  DB_NAME_DEV: string;
  DB_NAME_PROD: string;
  USERNAME_DB_DEV: string;
  USERNAME_DB_PROD: string;
  PASSWORD_DB_PROD: string;
  PASSWORD_DB_DEV: string;
  ENABLE_SWAGGER: boolean;
  SENTRY_URI: string;
  SENTRY_ENABLE: boolean;
  JWT_SECRET: string;
  URL_TOKEN: string;
  URL_AUTO_ENTRY: string;
}
