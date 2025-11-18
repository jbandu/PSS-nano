import client from 'prom-client';
import { Request, Response } from 'express';

// Create a Registry
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

/**
 * HTTP Request Duration Histogram
 */
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

/**
 * HTTP Request Counter
 */
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register],
});

/**
 * HTTP Request Error Counter
 */
export const httpErrorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'error_type'],
  registers: [register],
});

/**
 * Service Health Gauge
 */
export const serviceHealthGauge = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of backend services (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register],
});

/**
 * Service Response Time Histogram
 */
export const serviceResponseTime = new client.Histogram({
  name: 'service_response_time_seconds',
  help: 'Response time of backend services in seconds',
  labelNames: ['service', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

/**
 * Circuit Breaker State Gauge
 */
export const circuitBreakerState = new client.Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0 = closed, 1 = open, 2 = half-open)',
  labelNames: ['service'],
  registers: [register],
});

/**
 * Circuit Breaker Failures Counter
 */
export const circuitBreakerFailures = new client.Counter({
  name: 'circuit_breaker_failures_total',
  help: 'Total number of circuit breaker failures',
  labelNames: ['service'],
  registers: [register],
});

/**
 * Active Connections Gauge
 */
export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

/**
 * Request Size Summary
 */
export const requestSize = new client.Summary({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  registers: [register],
});

/**
 * Response Size Summary
 */
export const responseSize = new client.Summary({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/**
 * Middleware to track request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: Function) => {
  const start = Date.now();

  // Increment active connections
  activeConnections.inc();

  // Track request size
  const requestSizeBytes = parseInt(req.get('content-length') || '0', 10);
  if (requestSizeBytes > 0) {
    requestSize.observe({ method: req.method, route: req.route?.path || req.path }, requestSizeBytes);
  }

  // On response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCode, service: 'gateway' }, duration);
    httpRequestCounter.inc({ method, route, status_code: statusCode, service: 'gateway' });

    // Track response size
    const responseSizeBytes = parseInt(res.get('content-length') || '0', 10);
    if (responseSizeBytes > 0) {
      responseSize.observe({ method, route, status_code: statusCode }, responseSizeBytes);
    }

    // Track errors
    if (res.statusCode >= 400) {
      httpErrorCounter.inc({ method, route, status_code: statusCode, error_type: getErrorType(res.statusCode) });
    }

    // Decrement active connections
    activeConnections.dec();
  });

  next();
};

/**
 * Get error type from status code
 */
const getErrorType = (statusCode: number): string => {
  if (statusCode >= 400 && statusCode < 500) {
    return 'client_error';
  } else if (statusCode >= 500) {
    return 'server_error';
  }
  return 'unknown';
};

/**
 * Update service health metric
 */
export const updateServiceHealth = (serviceName: string, isHealthy: boolean) => {
  serviceHealthGauge.set({ service: serviceName }, isHealthy ? 1 : 0);
};

/**
 * Update circuit breaker state metric
 */
export const updateCircuitBreakerState = (serviceName: string, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN') => {
  const stateValue = state === 'CLOSED' ? 0 : state === 'OPEN' ? 1 : 2;
  circuitBreakerState.set({ service: serviceName }, stateValue);
};
