/**
 * Express Middleware for Observability
 * Provides logging, tracing, and metrics for Express applications
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger';
import { Metrics } from '../metrics';
import { getCorrelationId, initCorrelationContext, correlationNamespace } from '../utils/correlation';

export interface ObservabilityMiddlewareConfig {
  logger: Logger;
  metrics: Metrics;
  enableRequestLogging?: boolean;
  enableMetrics?: boolean;
  enableCorrelation?: boolean;
  excludePaths?: string[];
}

/**
 * Correlation ID middleware
 * Extracts or generates correlation ID and stores in context
 */
export function correlationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    correlationNamespace.run(() => {
      const correlationId =
        req.headers['x-correlation-id'] as string ||
        req.headers['x-request-id'] as string ||
        undefined;

      initCorrelationContext(correlationId);

      // Set correlation ID in response header
      res.setHeader('X-Correlation-ID', getCorrelationId());

      next();
    });
  };
}

/**
 * Request logging middleware
 * Logs all incoming requests and responses
 */
export function requestLoggingMiddleware(logger: Logger, excludePaths: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    // Log request
    logger.info(`Incoming request: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      correlationId: getCorrelationId(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any): Response {
      res.send = originalSend;

      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log response
      logger.logRequest(req.method, req.path, statusCode, duration, {
        correlationId: getCorrelationId(),
        responseSize: data ? JSON.stringify(data).length : 0
      });

      return res.send(data);
    };

    next();
  };
}

/**
 * Metrics middleware
 * Collects metrics for all requests
 */
export function metricsMiddleware(metrics: Metrics, excludePaths: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip metrics for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    // Increment active connections
    metrics.activeConnections.inc();
    metrics.requestsInProgress.inc();

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any): Response {
      res.send = originalSend;

      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      const statusCode = res.statusCode;
      const route = req.route?.path || req.path;

      // Record metrics
      metrics.httpRequestDuration.observe(
        { method: req.method, route, status_code: statusCode },
        duration
      );

      metrics.httpRequestTotal.inc({
        method: req.method,
        route,
        status_code: statusCode
      });

      if (statusCode >= 400) {
        metrics.httpRequestErrors.inc({
          method: req.method,
          route,
          status_code: statusCode,
          error_type: statusCode >= 500 ? 'server_error' : 'client_error'
        });
      }

      // Record request/response sizes
      if (req.headers['content-length']) {
        metrics.httpRequestSize.observe(
          { method: req.method, route },
          parseInt(req.headers['content-length'], 10)
        );
      }

      if (data) {
        const responseSize = typeof data === 'string'
          ? data.length
          : JSON.stringify(data).length;

        metrics.httpResponseSize.observe(
          { method: req.method, route },
          responseSize
        );
      }

      // Decrement active connections
      metrics.activeConnections.dec();
      metrics.requestsInProgress.dec();

      return res.send(data);
    };

    next();
  };
}

/**
 * Error logging middleware
 * Logs all errors
 */
export function errorLoggingMiddleware(logger: Logger) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error processing request: ${req.method} ${req.path}`, err, {
      method: req.method,
      path: req.path,
      query: req.query,
      correlationId: getCorrelationId(),
      statusCode: res.statusCode
    });

    next(err);
  };
}

/**
 * Combined observability middleware
 * Applies all observability middleware in the correct order
 */
export function observabilityMiddleware(config: ObservabilityMiddlewareConfig) {
  const {
    logger,
    metrics,
    enableRequestLogging = true,
    enableMetrics = true,
    enableCorrelation = true,
    excludePaths = ['/health', '/metrics']
  } = config;

  const middlewares: any[] = [];

  if (enableCorrelation) {
    middlewares.push(correlationMiddleware());
  }

  if (enableMetrics) {
    middlewares.push(metricsMiddleware(metrics, excludePaths));
  }

  if (enableRequestLogging) {
    middlewares.push(requestLoggingMiddleware(logger, excludePaths));
  }

  middlewares.push(errorLoggingMiddleware(logger));

  return middlewares;
}
