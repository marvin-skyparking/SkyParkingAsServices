import { Sequelize } from 'sequelize';
import EnvConfig from './env.config';

export const sequelizeUnikas = new Sequelize(
  EnvConfig.DB_NAME_PROD_UNIKAS, // ✅ database name
  EnvConfig.USERNAME_DB_PROD, // ✅ username
  EnvConfig.PASSWORD_DB_PROD, // ✅ password
  {
    host: EnvConfig.HOST_DB_PROD,
    dialect: 'mariadb',
    logging: false
  }
);
