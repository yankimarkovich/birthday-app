import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Validation Middleware
 *
 * Validates request body, params, or query using Zod schemas
 *
 * Usage:
 *   router.post('/', validate(createSchema), controller)
 *   router.get('/:id', validateParams(mongoIdSchema), controller)
 */

/**
 * Validate request body
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Validate request parameters (URL params like :id)
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Parameter validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Invalid parameter',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Validate request query string
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Query validation error:', error.errors);
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
