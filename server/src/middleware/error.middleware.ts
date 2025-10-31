import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const child = req.log || logger;
  const message = err instanceof Error ? err.stack || err.message : String(err);

  // Centralized error logging with request-scoped logger
  child.error(message);

  const body: Record<string, unknown> = {
    success: false,
    error: 'Internal server error',
  };
  if (isDev && err instanceof Error) {
    body.details = err.message;
  }
  return res.status(500).json(body);
}
