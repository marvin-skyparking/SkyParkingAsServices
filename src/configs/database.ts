import 'newrelic'; // first thing loaded
import newrelic from 'newrelic';
import { Sequelize } from 'sequelize';
import EnvConfig from './env.config';

const isProd = EnvConfig.NODE_ENV === 'production';

const dbName = isProd ? EnvConfig.DB_NAME_PROD : EnvConfig.DB_NAME_DEV;
const dbUser = isProd ? EnvConfig.USERNAME_DB_PROD : EnvConfig.USERNAME_DB_DEV;
const dbHost = isProd ? EnvConfig.HOST_DB_PROD : EnvConfig.HOST_DB_DEV;

// Send DB connection info (no passwords!) to New Relic
newrelic.addCustomAttribute('dbName', dbName);
newrelic.addCustomAttribute('dbHost', dbHost);
newrelic.addCustomAttribute('dbEnv', EnvConfig.NODE_ENV);

const sequelize = new Sequelize(
  dbName,
  dbUser,
  isProd ? EnvConfig.PASSWORD_DB_PROD : EnvConfig.PASSWORD_DB_DEV,
  {
    host: dbHost,
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
      connectTimeout: 100000
    },
    pool: {
      max: 50,
      min: 10,
      acquire: 60000,
      idle: 10000
    },
    timezone: '-01:00'
  }
);

export default sequelize;
