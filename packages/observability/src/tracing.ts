/**
 * Distributed Tracing with OpenTelemetry
 * Provides tracing capabilities for distributed systems
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { TracingConfig } from './types';
import * as api from '@opentelemetry/api';

export class Tracer {
  private sdk: NodeSDK | null = null;
  private config: TracingConfig;

  constructor(config: TracingConfig) {
    this.config = {
      enabled: true,
      jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      sampleRate: parseFloat(process.env.TRACE_SAMPLE_RATE || '1.0'),
      ...config
    };
  }

  initialize(): void {
    if (!this.config.enabled) {
      console.log('Tracing is disabled');
      return;
    }

    const jaegerExporter = new JaegerExporter({
      endpoint: this.config.jaegerEndpoint
    });

    this.sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0'
      }),
      traceExporter: jaegerExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Customize instrumentation
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            ignoreIncomingPaths: ['/health', '/metrics']
          },
          '@opentelemetry/instrumentation-express': {
            enabled: true
          },
          '@opentelemetry/instrumentation-pg': {
            enabled: true,
            enhancedDatabaseReporting: true
          }
        })
      ]
    });

    this.sdk.start();
    console.log(`OpenTelemetry tracing initialized for ${this.config.serviceName}`);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      this.shutdown();
    });
  }

  async shutdown(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
      console.log('OpenTelemetry tracing shut down');
    }
  }

  // Get the active tracer
  getTracer(): api.Tracer {
    return api.trace.getTracer(this.config.serviceName);
  }

  // Create a custom span
  createSpan(name: string, attributes?: api.SpanAttributes): api.Span {
    const tracer = this.getTracer();
    return tracer.startSpan(name, {
      attributes
    });
  }

  // Execute function within a span
  async withSpan<T>(
    name: string,
    fn: (span: api.Span) => Promise<T>,
    attributes?: api.SpanAttributes
  ): Promise<T> {
    const span = this.createSpan(name, attributes);

    try {
      const result = await fn(span);
      span.setStatus({ code: api.SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: api.SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  // Add event to current span
  addEvent(name: string, attributes?: api.SpanAttributes): void {
    const span = api.trace.getActiveSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  // Set attribute on current span
  setAttribute(key: string, value: api.SpanAttributeValue): void {
    const span = api.trace.getActiveSpan();
    if (span) {
      span.setAttribute(key, value);
    }
  }
}

export function createTracer(config: TracingConfig): Tracer {
  return new Tracer(config);
}
