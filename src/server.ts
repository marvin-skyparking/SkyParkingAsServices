import 'newrelic';

import app from './app';
import sequelize from './configs/database';
import EnvConfig from './configs/env.config';


const PORT = Number(EnvConfig.PORT) || 9000;

const startServer = async () => {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized.');

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
