import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Generate a unique correlation ID for request tracing
 */
export const generateCorrelationId = (): string => {
  return uuidv4();
};

/**
 * Middleware to add correlation ID to requests
 */
export const correlationIdMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Check if correlation ID exists in headers, otherwise generate new one
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    generateCorrelationId();

  // Attach to request object
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  next();
};

/**
 * Extract correlation ID from request
 */
export const getCorrelationId = (req: AuthenticatedRequest): string | undefined => {
  return req.correlationId;
};
