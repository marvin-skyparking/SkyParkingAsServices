import { Sequelize } from 'sequelize';
import EnvConfig from './env.config';

const sequelize = new Sequelize(
  EnvConfig.DB_DEV,
  EnvConfig.USERNAME_DB_DEV,
  EnvConfig.PASSWORD_DB_DEV,
  {
    host: '8.215.44.147',
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
      timezone: '+07:00' // Set timezone to UTC+7
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;
