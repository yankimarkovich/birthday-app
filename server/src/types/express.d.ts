// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
import type { Logger } from 'winston';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      requestId?: string;
      log?: Logger;
    }
  }
}
