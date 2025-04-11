import { Request, Response, NextFunction } from 'express';

export function haltOnTimeout(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).timedout) next();
}
