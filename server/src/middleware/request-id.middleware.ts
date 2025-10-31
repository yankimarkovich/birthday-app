import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const headerId = req.header('x-request-id');
  const id = headerId && headerId.trim().length > 0 ? headerId : crypto.randomUUID();

  req.requestId = id;
  res.setHeader('X-Request-ID', id);

  // Create a child logger carrying the requestId for downstream logs
  req.log = logger.child({ requestId: id });

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log one access line per request in dev (http level)
    req.log?.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}

