import { Request, Response, NextFunction } from 'express';
import { AppError, createLogger } from '@airline-ops/shared-utils';

const logger = createLogger('reservation-service');

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
};
