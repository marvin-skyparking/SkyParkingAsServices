import { Sequelize } from 'sequelize';
import EnvConfig from './env.config';

const isProd = EnvConfig.NODE_ENV === 'production';

const sequelize = new Sequelize(
  isProd ? EnvConfig.DB_NAME_PROD : EnvConfig.DB_NAME_DEV,
  isProd ? EnvConfig.USERNAME_DB_PROD : EnvConfig.USERNAME_DB_DEV,
  isProd ? EnvConfig.PASSWORD_DB_PROD : EnvConfig.PASSWORD_DB_DEV,
  {
    host: isProd ? EnvConfig.HOST_DB_PROD : EnvConfig.HOST_DB_DEV,
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
      connectTimeout: 100000
    },
    pool: {
      max: 50, // allow up to 50 concurrent DB connections
      min: 10, // keep at least 10 alive for quick reuse
      acquire: 60000, // wait up to 60 seconds for a connection
      idle: 10000 // release connection if idle for 10 seconds
    },
    timezone: '-01:00'
  }
);

export default sequelize;
