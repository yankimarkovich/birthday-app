import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

//FACTORY FUNCTION enable one validation function for all zod schemas
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(`Validation failed: ${JSON.stringify(error.errors)}`);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      logger.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
};
