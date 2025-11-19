/**
 * Observability Package
 * Centralized logging, tracing, and metrics for microservices
 */

export * from './types';
export * from './logger';
export * from './tracing';
export * from './metrics';
export * from './health';
export * from './middleware/express';
export * from './utils/correlation';
export * from './utils/pii-masking';

import { ObservabilityConfig, Environment, LogLevel } from './types';
import { Logger, createLogger } from './logger';
import { Tracer, createTracer } from './tracing';
import { Metrics, createMetrics } from './metrics';
import { HealthChecker } from './health';

/**
 * Observability class that combines logging, tracing, and metrics
 */
export class Observability {
  public logger: Logger;
  public tracer: Tracer;
  public metrics: Metrics;
  public health: HealthChecker;

  constructor(config: ObservabilityConfig) {
    this.logger = createLogger(config.logger);
    this.tracer = createTracer(config.tracing);
    this.metrics = createMetrics(config.metrics);
    this.health = new HealthChecker(
      config.logger.serviceName,
      process.env.SERVICE_VERSION || '1.0.0'
    );
  }

  /**
   * Initialize all observability components
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing observability components...');

    // Initialize tracing
    this.tracer.initialize();

    this.logger.info('Observability initialization complete', {
      service: this.logger['config'].serviceName,
      environment: this.logger['config'].environment
    });
  }

  /**
   * Shutdown all observability components
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down observability components...');
    await this.tracer.shutdown();
    this.logger.info('Observability shutdown complete');
  }
}

/**
 * Factory function to create observability instance
 */
export function createObservability(
  serviceName: string,
  environment: Environment = Environment.DEVELOPMENT
): Observability {
  const config: ObservabilityConfig = {
    logger: {
      serviceName,
      environment,
      logLevel: process.env.LOG_LEVEL as LogLevel || LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      enablePIIMasking: environment === Environment.PRODUCTION,
      correlationIdEnabled: true
    },
    tracing: {
      serviceName,
      environment,
      enabled: process.env.ENABLE_TRACING !== 'false',
      jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      sampleRate: parseFloat(process.env.TRACE_SAMPLE_RATE || '1.0')
    },
    metrics: {
      serviceName,
      environment,
      enabled: process.env.ENABLE_METRICS !== 'false',
      port: parseInt(process.env.METRICS_PORT || '9090', 10),
      path: '/metrics',
      collectDefaultMetrics: true
    }
  };

  return new Observability(config);
}

/**
 * Express app setup helper
 */
export function setupObservabilityEndpoints(app: any, observability: Observability): void {
  // Metrics endpoint
  app.get('/metrics', async (req: any, res: any) => {
    try {
      const metrics = await observability.metrics.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      res.status(500).send('Error collecting metrics');
    }
  });

  // Health endpoints
  app.get('/health', observability.health.middleware());
  app.get('/health/liveness', observability.health.livenessProbe());
  app.get('/health/readiness', observability.health.readinessProbe());
}
