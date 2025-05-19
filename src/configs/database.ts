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
      max: 500,
      min: 20,
      acquire: 60000,
      idle: 20000
    }
  }
);

export default sequelize;
