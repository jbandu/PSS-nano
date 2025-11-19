# Airline PSS Observability Infrastructure

Comprehensive observability infrastructure for the Airline Passenger Service System (PSS) platform, providing centralized logging, distributed tracing, metrics collection, and alerting.

## 🏗️ Architecture Overview

### Components

1. **Logging Stack**
   - **Loki**: Log aggregation and storage
   - **Promtail**: Log collection and forwarding
   - **Grafana**: Log visualization and querying

2. **Metrics Stack**
   - **Prometheus**: Metrics collection and storage
   - **Node Exporter**: System metrics
   - **cAdvisor**: Container metrics
   - **Grafana**: Metrics visualization

3. **Tracing Stack**
   - **Jaeger**: Distributed tracing backend
   - **OpenTelemetry**: Instrumentation library

4. **Alerting Stack**
   - **AlertManager**: Alert routing and management
   - **Prometheus**: Alert rules evaluation

5. **Shared Library**
   - **@airline/observability**: Centralized observability package for all services

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ for service instrumentation
- 8GB+ RAM recommended
- Ports available: 3010, 3100, 9090, 9093, 16686

### 1. Start Observability Stack

```bash
# Navigate to observability infrastructure
cd infrastructure/observability

# Start all observability services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check logs if any service fails
docker-compose logs -f [service-name]
```

### 2. Install Observability Package in Services

```bash
# In your service directory
cd services/your-service

# Add observability package
npm install @airline/observability

# Or if using workspace
npm install @airline/observability --workspace=your-service
```

### 3. Instrument Your Service

See [Service Instrumentation Guide](#service-instrumentation-guide) below.

### 4. Access Dashboards

Once the stack is running:

- **Grafana**: http://localhost:3010 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **AlertManager**: http://localhost:9093

## 📊 Grafana Dashboards

Pre-configured dashboards available in Grafana:

### 1. Executive Dashboard
High-level KPIs for business and technical leadership:
- Total requests/sec, error rate, latency (P95/P99)
- Active users, booking rate, revenue per minute
- System health overview
- SLA compliance metrics

**Access**: Grafana → Dashboards → Executive Dashboard

### 2. Service Overview Dashboard
Per-service performance metrics:
- Request rate, error rate, response times by service
- Request/response sizes
- Active connections
- Top endpoints by traffic

**Access**: Grafana → Dashboards → Service Overview

### 3. Infrastructure Dashboard
System and container metrics:
- CPU, memory, disk, network usage
- Container metrics (CPU, memory, restarts)
- System load averages
- Resource thresholds with color coding

**Access**: Grafana → Dashboards → Infrastructure

### 4. Database Dashboard
Database performance and health:
- Query duration percentiles (P50, P95, P99)
- Connection pool usage
- Slow queries (>1s)
- Query types, errors, cache hit ratio
- Top 10 slowest queries

**Access**: Grafana → Dashboards → Database

### 5. Business Metrics Dashboard
Business KPIs and analytics:
- Booking funnel (search → confirmation)
- Payment success/failure rates
- Revenue trends by booking class
- Cancellation analysis
- Top routes, ancillary services
- Daily totals (bookings, revenue, check-ins)

**Access**: Grafana → Dashboards → Business Metrics

### 6. Security Dashboard
Security monitoring and threat detection:
- Failed authentication attempts
- Unauthorized access (403s)
- Fraud detection indicators
- Rate limit violations
- PII data access audit
- Suspicious activity by country

**Access**: Grafana → Dashboards → Security

## 🔍 Service Instrumentation Guide

### Basic Setup

```typescript
// src/observability.ts
import { createObservability, Environment } from '@airline/observability';

export const observability = createObservability(
  'your-service-name',
  process.env.NODE_ENV as Environment || Environment.DEVELOPMENT
);

// Initialize observability
await observability.initialize();

// Export for use in application
export const { logger, tracer, metrics, health } = observability;
```

### Express Application Setup

```typescript
// src/app.ts
import express from 'express';
import { observability, logger, metrics, health } from './observability';
import { observabilityMiddleware, setupObservabilityEndpoints } from '@airline/observability';

const app = express();

// Apply observability middleware (must be early in middleware chain)
const obsMiddleware = observabilityMiddleware({
  logger,
  metrics,
  enableRequestLogging: true,
  enableMetrics: true,
  enableCorrelation: true,
  excludePaths: ['/health', '/metrics']
});

app.use(...obsMiddleware);

// Setup observability endpoints
setupObservabilityEndpoints(app, observability);

// Your application routes...
app.use('/api', apiRoutes);

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Service started on port ${PORT}`, { port: PORT });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close();
  await observability.shutdown();
});
```

### Health Checks

```typescript
// src/observability.ts
import { health } from './observability';
import { HealthStatus, databaseHealthCheck } from '@airline/observability';
import { prisma } from './database';
import { redis } from './cache';

// Register database health check
health.registerCheck('database', async () => {
  return databaseHealthCheck(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  });
});

// Register Redis health check
health.registerCheck('redis', async () => {
  try {
    await redis.ping();
    return { status: HealthStatus.HEALTHY, message: 'Redis is healthy' };
  } catch (error) {
    return { status: HealthStatus.UNHEALTHY, message: 'Redis is unavailable' };
  }
});

// Register custom health check
health.registerCheck('external-api', async () => {
  try {
    const response = await fetch('https://api.example.com/health');
    return {
      status: response.ok ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      message: `External API returned ${response.status}`
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: 'External API unreachable'
    };
  }
});
```

### Logging Examples

```typescript
import { logger } from './observability';

// Basic logging
logger.info('User logged in', { userId: user.id, email: user.email });
logger.warn('Rate limit approaching', { userId: user.id, requestCount: 95 });
logger.error('Payment processing failed', new Error('Gateway timeout'), {
  userId: user.id,
  bookingId: booking.id,
  amount: payment.amount
});

// Request logging (automatic with middleware)
// Logged automatically: method, path, status, duration, correlationId

// Database query logging
logger.logDatabaseQuery('SELECT * FROM bookings WHERE id = $1', 145, {
  bookingId: booking.id
});

// External API call logging
logger.logExternalApiCall('stripe', '/v1/charges', 523, 200, {
  amount: 1000,
  currency: 'USD'
});

// Business event logging
logger.logBusinessEvent('booking', 'booking_created', {
  bookingId: booking.id,
  userId: user.id,
  amount: booking.totalAmount,
  flightId: booking.flightId
});

// Security event logging
logger.logSecurityEvent('auth_failure', 'high', {
  ipAddress: req.ip,
  username: credentials.username,
  reason: 'invalid_password'
});
```

### Metrics Examples

```typescript
import { metrics } from './observability';

// HTTP metrics (automatic with middleware)
// Tracked automatically: request duration, count, errors, sizes

// Custom business metrics
metrics.businessEventTotal.inc({
  event_type: 'booking',
  event_name: 'booking_created'
});

// Database metrics
const queryTimer = metrics.dbQueryDuration.startTimer({
  operation: 'SELECT',
  table: 'bookings'
});
// ... execute query ...
queryTimer();

metrics.dbQueryTotal.inc({
  operation: 'SELECT',
  table: 'bookings'
});

// External API metrics
const apiTimer = metrics.externalApiDuration.startTimer({
  service: 'stripe',
  endpoint: '/v1/charges',
  status_code: '200'
});
// ... make API call ...
apiTimer();

// Cache metrics
if (cachedValue) {
  metrics.cacheHits.inc({ cache_name: 'booking' });
} else {
  metrics.cacheMisses.inc({ cache_name: 'booking' });
}

// Queue metrics
metrics.queueDepth.set({ queue_name: 'email' }, emailQueue.length);

const jobTimer = metrics.queueProcessingDuration.startTimer({
  queue_name: 'email',
  job_type: 'booking_confirmation'
});
// ... process job ...
jobTimer();

// Custom metrics
const customCounter = metrics.createCounter(
  'booking_special_requests_total',
  'Total number of booking special requests',
  ['request_type']
);

customCounter.inc({ request_type: 'wheelchair' });
```

### Distributed Tracing Examples

```typescript
import { tracer } from './observability';
import * as api from '@opentelemetry/api';

// Custom span with automatic instrumentation
async function processBooking(bookingData: BookingData) {
  return await tracer.withSpan(
    'process_booking',
    async (span) => {
      span.setAttribute('booking.id', bookingData.id);
      span.setAttribute('booking.amount', bookingData.amount);

      // Your business logic
      const result = await createBooking(bookingData);

      span.addEvent('booking_created', {
        'booking.pnr': result.pnr
      });

      return result;
    },
    {
      'service.name': 'reservation-service',
      'operation.type': 'booking_creation'
    }
  );
}

// Manual span management
async function complexOperation() {
  const span = tracer.createSpan('complex_operation', {
    'operation.complexity': 'high'
  });

  try {
    // Step 1
    tracer.addEvent('step_1_started');
    await step1();

    // Step 2
    tracer.addEvent('step_2_started');
    await step2();

    span.setStatus({ code: api.SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: api.SpanStatusCode.ERROR,
      message: error.message
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

## 🚨 Alerting

### Alert Categories

Alerts are categorized by severity and routed accordingly:

- **Critical**: PagerDuty + Slack (immediate response required)
- **Warning**: Slack (requires attention)
- **Info**: Logged (informational)

### Alert Channels

Configure in `alertmanager/config.yml`:

```yaml
# Update with your credentials
global:
  smtp_from: 'alerts@your-airline.com'
  smtp_auth_username: 'alerts@your-airline.com'
  smtp_auth_password: 'your-password'
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK'
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
```

### Available Alerts

**Service Alerts** (`prometheus/alerts/service-alerts.yml`):
- HighErrorRate (>5%)
- CriticalErrorRate (>10%)
- HighResponseTime (P95 >2s)
- ServiceDown
- HighMemoryUsage (>2GB)
- HighCPUUsage (>80%)
- DatabaseConnectionPoolNearlyExhausted (>80%)
- SlowDatabaseQueries (P95 >1s)
- HighQueueDepth (>1000)
- ExternalAPIHighErrorRate (>10%)
- LowCacheHitRate (<50%)

**Business Alerts** (`prometheus/alerts/business-alerts.yml`):
- LowBookingRate (<0.1/s)
- HighPaymentFailureRate (>15%)
- HighCancellationRate (>20%)
- InventoryOverbooking
- SLAViolationResponseTime (P99 >200ms)
- SLAViolationAvailability (<99.9%)
- RevenueDrop (>30% vs yesterday)
- SuspiciousFraudActivity
- FailedAuthenticationSpike

## 📚 Runbooks

Detailed incident response runbooks available in `/runbooks/`:

1. **[High Error Rate](./runbooks/high-error-rate.md)**
   - Investigation steps
   - Common scenarios and resolutions
   - Communication templates

2. **[Service Down](./runbooks/service-down.md)**
   - Quick recovery actions
   - Root cause analysis
   - Prevention measures

3. **[High Latency](./runbooks/high-latency.md)**
   - Performance investigation
   - Optimization strategies
   - Prevention techniques

## 🔧 Configuration

### Environment Variables

Services should set these environment variables:

```bash
# Service identification
SERVICE_NAME=reservation-service
SERVICE_VERSION=1.0.0
NODE_ENV=production

# Logging
LOG_LEVEL=info                          # debug, info, warn, error
ENABLE_PII_MASKING=true                 # Mask PII in logs

# Tracing
ENABLE_TRACING=true
JAEGER_ENDPOINT=http://jaeger:14268/api/traces
TRACE_SAMPLE_RATE=1.0                   # 0.0 to 1.0 (100%)

# Metrics
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Loki Configuration

Retention and storage configured in `loki/config.yaml`:

```yaml
limits_config:
  retention_period: 720h  # 30 days hot storage

compactor:
  retention_enabled: true
  retention_delete_delay: 2h
```

For cold storage (1 year), configure S3/GCS backend.

### Prometheus Configuration

Scrape intervals and retention in `prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Storage retention
--storage.tsdb.retention.time=30d
```

## 🐳 Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| Grafana | 3010 | Visualization platform |
| Loki | 3100 | Log aggregation |
| Promtail | - | Log collector |
| Prometheus | 9090 | Metrics storage |
| AlertManager | 9093 | Alert management |
| Jaeger | 16686 | Tracing UI |
| Jaeger Collector | 14268 | Trace ingestion |
| Node Exporter | 9100 | System metrics |
| cAdvisor | 8080 | Container metrics |

## 📈 Performance Considerations

### Resource Requirements

**Minimum** (Development):
- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB

**Recommended** (Production):
- CPU: 8+ cores
- RAM: 16GB+
- Disk: 500GB+ SSD

### Storage Estimates

- **Logs**: ~10GB per day (depends on traffic)
- **Metrics**: ~5GB per day
- **Traces**: ~2GB per day (with 10% sampling)

### Optimization Tips

1. **Adjust Sample Rates**: Lower trace sample rate in high-traffic scenarios
2. **Log Levels**: Use INFO or WARN in production
3. **Metric Cardinality**: Avoid high-cardinality labels
4. **Retention Policies**: Tune based on compliance requirements
5. **Storage Backend**: Use S3/GCS for long-term storage

## 🔒 Security

### PII Masking

The observability library automatically masks PII in logs:

- Email addresses
- Credit card numbers
- SSN
- Phone numbers
- Passport numbers

Configured via `enablePIIMasking` in logger config.

### Access Control

- **Grafana**: Change default admin password
- **Prometheus**: Enable authentication for production
- **Jaeger**: Use authentication proxy in production

### Network Security

- Use internal networks for observability services
- Expose only Grafana publicly (behind auth)
- Use TLS for all inter-service communication in production

## 🛠️ Troubleshooting

### Observability Stack Not Starting

```bash
# Check Docker resources
docker system df

# Check logs
docker-compose logs -f

# Restart specific service
docker-compose restart prometheus

# Full reset
docker-compose down -v
docker-compose up -d
```

### No Metrics Appearing in Prometheus

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify service is exposing metrics
curl http://localhost:3000/metrics

# Check Prometheus configuration
docker exec airline-prometheus cat /etc/prometheus/prometheus.yml
```

### No Logs in Loki

```bash
# Check Promtail status
docker-compose logs promtail

# Verify log files exist
ls -la logs/

# Test Loki API
curl http://localhost:3100/ready

# Check Promtail config
docker exec airline-promtail cat /etc/promtail/config.yaml
```

### No Traces in Jaeger

```bash
# Verify JAEGER_ENDPOINT is set correctly
echo $JAEGER_ENDPOINT

# Check Jaeger collector
curl http://localhost:14268/

# Verify OpenTelemetry is initialized
# Check service logs for initialization message
```

## 📖 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)

## 🤝 Contributing

When adding new services or features:

1. Instrument with @airline/observability package
2. Add service to Prometheus scrape config
3. Create service-specific dashboard if needed
4. Add relevant alerts
5. Document in service README

## 📝 License

Internal use only - Airline PSS Platform
