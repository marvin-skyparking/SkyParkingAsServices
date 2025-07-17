import app from './app';
import sequelize from './configs/database';
import EnvConfig from './configs/env.config';

const PORT = EnvConfig.PORT || 9000;

const startServer = async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
