/**
 * Metrics Collection with Prometheus
 * Provides standardized metrics collection and exposure
 */

import { register, Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { MetricsConfig } from './types';

export class Metrics {
  private registry: Registry;
  private config: MetricsConfig;

  // Standard HTTP metrics
  public httpRequestDuration: Histogram;
  public httpRequestTotal: Counter;
  public httpRequestErrors: Counter;
  public httpRequestSize: Histogram;
  public httpResponseSize: Histogram;

  // Database metrics
  public dbQueryDuration: Histogram;
  public dbQueryTotal: Counter;
  public dbQueryErrors: Counter;
  public dbConnectionPoolSize: Gauge;
  public dbConnectionPoolUsed: Gauge;

  // External API metrics
  public externalApiDuration: Histogram;
  public externalApiTotal: Counter;
  public externalApiErrors: Counter;

  // Cache metrics
  public cacheHits: Counter;
  public cacheMisses: Counter;
  public cacheSize: Gauge;

  // Queue metrics
  public queueDepth: Gauge;
  public queueProcessingDuration: Histogram;
  public queueProcessedTotal: Counter;
  public queueFailedTotal: Counter;

  // Business metrics
  public businessEventTotal: Counter;

  // Custom metrics
  public activeConnections: Gauge;
  public requestsInProgress: Gauge;

  constructor(config: MetricsConfig) {
    this.config = {
      enabled: true,
      port: 9090,
      path: '/metrics',
      collectDefaultMetrics: true,
      ...config
    };

    this.registry = new Registry();

    // Set default labels
    this.registry.setDefaultLabels({
      service: this.config.serviceName,
      environment: this.config.environment
    });

    // Collect default metrics (CPU, memory, etc.)
    if (this.config.collectDefaultMetrics) {
      collectDefaultMetrics({ register: this.registry });
    }

    // Initialize HTTP metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry]
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry]
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status_code', 'error_type'],
      registers: [this.registry]
    });

    this.httpRequestSize = new Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.registry]
    });

    this.httpResponseSize = new Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.registry]
    });

    // Database metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry]
    });

    this.dbQueryTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table'],
      registers: [this.registry]
    });

    this.dbQueryErrors = new Counter({
      name: 'db_query_errors_total',
      help: 'Total number of database query errors',
      labelNames: ['operation', 'table', 'error_type'],
      registers: [this.registry]
    });

    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Size of database connection pool',
      registers: [this.registry]
    });

    this.dbConnectionPoolUsed = new Gauge({
      name: 'db_connection_pool_used',
      help: 'Number of used database connections',
      registers: [this.registry]
    });

    // External API metrics
    this.externalApiDuration = new Histogram({
      name: 'external_api_duration_seconds',
      help: 'Duration of external API calls in seconds',
      labelNames: ['service', 'endpoint', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.registry]
    });

    this.externalApiTotal = new Counter({
      name: 'external_api_calls_total',
      help: 'Total number of external API calls',
      labelNames: ['service', 'endpoint', 'status_code'],
      registers: [this.registry]
    });

    this.externalApiErrors = new Counter({
      name: 'external_api_errors_total',
      help: 'Total number of external API errors',
      labelNames: ['service', 'endpoint', 'error_type'],
      registers: [this.registry]
    });

    // Cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_name'],
      registers: [this.registry]
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_name'],
      registers: [this.registry]
    });

    this.cacheSize = new Gauge({
      name: 'cache_size_bytes',
      help: 'Current cache size in bytes',
      labelNames: ['cache_name'],
      registers: [this.registry]
    });

    // Queue metrics
    this.queueDepth = new Gauge({
      name: 'queue_depth',
      help: 'Current queue depth',
      labelNames: ['queue_name'],
      registers: [this.registry]
    });

    this.queueProcessingDuration = new Histogram({
      name: 'queue_processing_duration_seconds',
      help: 'Duration of queue job processing',
      labelNames: ['queue_name', 'job_type'],
      buckets: [0.1, 1, 5, 10, 30, 60, 300],
      registers: [this.registry]
    });

    this.queueProcessedTotal = new Counter({
      name: 'queue_processed_total',
      help: 'Total number of processed queue jobs',
      labelNames: ['queue_name', 'job_type', 'status'],
      registers: [this.registry]
    });

    this.queueFailedTotal = new Counter({
      name: 'queue_failed_total',
      help: 'Total number of failed queue jobs',
      labelNames: ['queue_name', 'job_type', 'error_type'],
      registers: [this.registry]
    });

    // Business metrics
    this.businessEventTotal = new Counter({
      name: 'business_events_total',
      help: 'Total number of business events',
      labelNames: ['event_type', 'event_name'],
      registers: [this.registry]
    });

    // Custom metrics
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.registry]
    });

    this.requestsInProgress = new Gauge({
      name: 'requests_in_progress',
      help: 'Number of requests currently in progress',
      registers: [this.registry]
    });
  }

  // Get metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Get registry for custom metrics
  getRegistry(): Registry {
    return this.registry;
  }

  // Create custom counter
  createCounter(name: string, help: string, labelNames?: string[]): Counter {
    return new Counter({
      name,
      help,
      labelNames,
      registers: [this.registry]
    });
  }

  // Create custom histogram
  createHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): Histogram {
    return new Histogram({
      name,
      help,
      labelNames,
      buckets,
      registers: [this.registry]
    });
  }

  // Create custom gauge
  createGauge(name: string, help: string, labelNames?: string[]): Gauge {
    return new Gauge({
      name,
      help,
      labelNames,
      registers: [this.registry]
    });
  }
}

export function createMetrics(config: MetricsConfig): Metrics {
  return new Metrics(config);
}
