import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Validate request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Request body validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Query parameters validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate route parameters against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Route parameters validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
