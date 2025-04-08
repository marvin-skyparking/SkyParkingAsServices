import { Request, Response } from 'express';
import { getHealthStatus } from '../services/check_server_health';

export async function healthCheckController(req: Request, res: Response) {
  function getFormattedTimestamp(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  try {
    const result = await getHealthStatus();

    res.status(result.HttpCode).json({
      Status: result.Status,
      Time: getFormattedTimestamp(),
      Message: result.Message,
      ConnectionResponseTime: result.ConnectionResponseTime
    });
  } catch (error) {
    console.log((error as Error).message);
    res.status(500).json({
      Status: 'DownTime',
      Time: getFormattedTimestamp(),
      Message: 'Please Wait For The Server To Be Up'
    });
  }
}
