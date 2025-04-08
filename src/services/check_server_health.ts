import { checkDatabaseConnection } from '../utils/db';

const SLOW_THRESHOLD = 1000; // ms

export async function getHealthStatus() {
  const dbStatus = await checkDatabaseConnection();
  const isSlow = dbStatus.responseTime > SLOW_THRESHOLD;

  if (!dbStatus.healthy) {
    return {
      Status: 'Error',
      Message: 'Connection Failed ❌',
      ConnectionResponseTime: `${dbStatus.responseTime}ms`,
      HttpCode: 503
    };
  }

  return {
    Status: isSlow ? 'WARNING' : 'OK',
    Message: isSlow ? 'Database Connection Is Slow' : 'API Is Healthy 🚀',
    ConnectionResponseTime: `${dbStatus.responseTime}ms`,
    HttpCode: 200
  };
}
