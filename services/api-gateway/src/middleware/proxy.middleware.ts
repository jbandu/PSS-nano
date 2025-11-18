import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceEndpoint } from '../config/services.config';
import { circuitBreakerManager } from '../services/circuit-breaker.service';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';
import { BadGatewayError, GatewayTimeoutError } from '../utils/errors';
import { serviceResponseTime } from '../utils/metrics';

/**
 * Create a proxy middleware for a service
 */
export const createServiceProxy = (service: ServiceEndpoint) => {
  const proxyOptions: Options = {
    target: service.url,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Remove the service prefix from the path
      // e.g., /api/v1/reservations/xyz -> /reservations/xyz
      const servicePath = getServicePath(service.name);
      return path.replace(servicePath, '');
    },

    // Add custom headers
    onProxyReq: (proxyReq, req: Request) => {
      const authenticatedReq = req as AuthenticatedRequest;

      // Forward correlation ID
      if (authenticatedReq.correlationId) {
        proxyReq.setHeader('X-Correlation-ID', authenticatedReq.correlationId);
      }

      // Forward user context
      if (authenticatedReq.user) {
        proxyReq.setHeader('X-User-ID', authenticatedReq.user.id);
        proxyReq.setHeader('X-User-Email', authenticatedReq.user.email);
        proxyReq.setHeader('X-User-Role', authenticatedReq.user.role);

        if (authenticatedReq.user.organizationId) {
          proxyReq.setHeader('X-Organization-ID', authenticatedReq.user.organizationId);
        }
      }

      // Forward API key context
      if (authenticatedReq.apiKey) {
        proxyReq.setHeader('X-API-Key-ID', authenticatedReq.apiKey.id);
      }

      logger.debug(`Proxying request to ${service.name}`, {
        method: req.method,
        path: req.path,
        target: service.url,
        correlationId: authenticatedReq.correlationId,
      });
    },

    // Handle proxy response
    onProxyRes: (proxyRes, req, res) => {
      const authenticatedReq = req as AuthenticatedRequest;

      logger.debug(`Received response from ${service.name}`, {
        statusCode: proxyRes.statusCode,
        correlationId: authenticatedReq.correlationId,
      });
    },

    // Handle proxy errors
    onError: (err, req, res) => {
      const authenticatedReq = req as AuthenticatedRequest;

      logger.error(`Proxy error for ${service.name}`, {
        error: err.message,
        correlationId: authenticatedReq.correlationId,
      });

      // Determine error type
      if (err.message.includes('timeout') || err.message.includes('ETIMEDOUT')) {
        const error = new GatewayTimeoutError(`Service ${service.name} timeout`);
        res.status(error.statusCode).json({
          status: 'error',
          statusCode: error.statusCode,
          message: error.message,
          correlationId: authenticatedReq.correlationId,
          timestamp: new Date().toISOString(),
        });
      } else {
        const error = new BadGatewayError(`Service ${service.name} error: ${err.message}`);
        res.status(error.statusCode).json({
          status: 'error',
          statusCode: error.statusCode,
          message: error.message,
          correlationId: authenticatedReq.correlationId,
          timestamp: new Date().toISOString(),
        });
      }
    },

    // Timeout configuration
    proxyTimeout: service.timeout,
    timeout: service.timeout,

    // Logging
    logLevel: 'silent', // We handle logging ourselves
  };

  return createProxyMiddleware(proxyOptions);
};

/**
 * Get the API path prefix for a service
 */
const getServicePath = (serviceName: string): string => {
  const pathMap: Record<string, string> = {
    'auth-service': '/api/v1/auth',
    'reservation-service': '/api/v1/reservations',
    'inventory-service': '/api/v1/inventory',
    'payment-service': '/api/v1/payments',
    'notification-service': '/api/v1/notifications',
    'flight-service': '/api/v1/flights',
  };

  return pathMap[serviceName] || `/api/v1/${serviceName}`;
};

/**
 * Middleware to measure service response time
 */
export const measureResponseTime = (serviceName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      serviceResponseTime.observe(
        { service: serviceName, operation: req.method },
        duration
      );
    });

    next();
  };
};

/**
 * Middleware to check circuit breaker before proxying
 */
export const checkCircuitBreaker = (service: ServiceEndpoint) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!service.circuitBreaker?.enabled) {
      return next();
    }

    try {
      const stats = circuitBreakerManager.getStats(service.name);

      if (stats && stats.state === 'OPEN') {
        const authenticatedReq = req as AuthenticatedRequest;

        logger.warn(`Circuit breaker open for ${service.name}`, {
          correlationId: authenticatedReq.correlationId,
        });

        return res.status(503).json({
          status: 'error',
          statusCode: 503,
          message: `Service ${service.name} is currently unavailable`,
          correlationId: authenticatedReq.correlationId,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
