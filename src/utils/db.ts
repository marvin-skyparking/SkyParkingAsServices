import sequelize from '../configs/database'; // Adjust the path to your Sequelize instance

export async function checkDatabaseConnection(): Promise<{
  healthy: boolean;
  responseTime: number;
}> {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    return {
      healthy: true,
      responseTime: Date.now() - start
    };
  } catch (err) {
    return {
      healthy: false,
      responseTime: Date.now() - start
    };
  }
}
