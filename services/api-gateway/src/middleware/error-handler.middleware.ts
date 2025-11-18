import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/errors';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';
import config from '../config';

/**
 * Error Response Interface
 */
interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: any[];
  stack?: string;
  correlationId?: string;
  timestamp: string;
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: any[] | undefined;

  // Handle known API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Handle JWT errors
  else if (err.name === 'UnauthorizedError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid or expired token';
  }

  // Handle validation errors (Zod)
  else if (err.name === 'ZodError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = (err as any).errors;
  }

  // Handle syntax errors in JSON
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON in request body';
  }

  // Log the error
  logger.error('Request error', {
    statusCode,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    correlationId: req.correlationId,
    userId: req.user?.id,
    organizationId: req.user?.organizationId,
  });

  // Build error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    statusCode,
    message,
    correlationId: req.correlationId,
    timestamp: new Date().toISOString(),
  };

  // Add validation errors if present
  if (errors && errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Add stack trace in development
  if (config.env === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    statusCode: StatusCodes.NOT_FOUND,
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
