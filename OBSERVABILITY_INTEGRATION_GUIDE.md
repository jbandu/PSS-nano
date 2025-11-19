# Observability Integration Guide

This guide shows how to integrate the comprehensive observability infrastructure into existing services.

## 📦 Package Installation

### 1. Build the Observability Package

```bash
# Navigate to observability package
cd packages/observability

# Install dependencies
npm install

# Build the package
npm run build

# Link for local development
npm link
```

### 2. Install in Service

```bash
# Navigate to your service
cd services/auth-service  # or any service

# Link the observability package
npm link @airline/observability

# Or add to package.json and install
npm install
```

## 🔧 Service Integration Steps

### Step 1: Create Observability Configuration

Create `src/observability/index.ts`:

```typescript
import {
  createObservability,
  Environment,
  setupObservabilityEndpoints,
  databaseHealthCheck,
  redisHealthCheck,
} from '@airline/observability';
import { prisma } from '../database';
import { redis } from '../cache';

// Create observability instance
export const observability = createObservability(
  process.env.SERVICE_NAME || 'auth-service',
  (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT
);

// Export individual components for convenience
export const { logger, tracer, metrics, health } = observability;

// Initialize observability (call this in your app startup)
export async function initializeObservability() {
  await observability.initialize();
  registerHealthChecks();
  logger.info('Observability initialized successfully');
}

// Register health checks
function registerHealthChecks() {
  // Database health check
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

  // Redis health check
  health.registerCheck('redis', async () => {
    return redisHealthCheck(async () => {
      try {
        await redis.ping();
        return true;
      } catch {
        return false;
      }
    });
  });
}

// Graceful shutdown
export async function shutdownObservability() {
  logger.info('Shutting down observability...');
  await observability.shutdown();
}
```

### Step 2: Update Application Entry Point

Update `src/index.ts` or `src/server.ts`:

```typescript
import express from 'express';
import { observabilityMiddleware, setupObservabilityEndpoints } from '@airline/observability';
import {
  observability,
  logger,
  metrics,
  initializeObservability,
  shutdownObservability,
} from './observability';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize observability FIRST
    await initializeObservability();

    // Apply standard middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Apply observability middleware (MUST be early in chain)
    const obsMiddleware = observabilityMiddleware({
      logger,
      metrics,
      enableRequestLogging: true,
      enableMetrics: true,
      enableCorrelation: true,
      excludePaths: ['/health', '/metrics'],
    });
    app.use(...obsMiddleware);

    // Setup observability endpoints (/health, /metrics, /health/liveness, /health/readiness)
    setupObservabilityEndpoints(app, observability);

    // Your application routes
    app.use('/api', routes);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Service started successfully`, {
        port: PORT,
        env: process.env.NODE_ENV,
        version: process.env.SERVICE_VERSION || '1.0.0',
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connections
        await prisma.$disconnect();
        logger.info('Database connections closed');

        // Shutdown observability
        await shutdownObservability();

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

### Step 3: Update Business Logic with Logging

Example: `src/services/auth.service.ts`

```typescript
import { logger, tracer, metrics } from '../observability';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { prisma } from '../database';

export class AuthService {
  async login(email: string, password: string, ipAddress: string) {
    const correlationId = logger['config'].correlationIdEnabled
      ? require('@airline/observability').getCorrelationId()
      : undefined;

    logger.info('Login attempt', { email, ipAddress, correlationId });

    return await tracer.withSpan(
      'user_login',
      async (span) => {
        span.setAttribute('user.email', email);
        span.setAttribute('client.ip', ipAddress);

        try {
          // Find user
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            logger.logSecurityEvent('auth_failure', 'medium', {
              reason: 'user_not_found',
              email,
              ipAddress,
            });

            metrics.businessEventTotal.inc({
              event_type: 'auth',
              event_name: 'login_failed',
            });

            throw new Error('Invalid credentials');
          }

          // Verify password
          const isValid = await verifyPassword(password, user.passwordHash);

          if (!isValid) {
            logger.logSecurityEvent('auth_failure', 'high', {
              reason: 'invalid_password',
              userId: user.id,
              email,
              ipAddress,
            });

            metrics.businessEventTotal.inc({
              event_type: 'auth',
              event_name: 'login_failed',
            });

            // Increment failed attempts
            await this.incrementFailedAttempts(user.id);

            throw new Error('Invalid credentials');
          }

          // Success
          logger.info('Login successful', {
            userId: user.id,
            email: user.email,
          });

          logger.logBusinessEvent('auth', 'login_success', {
            userId: user.id,
            email: user.email,
            ipAddress,
          });

          metrics.businessEventTotal.inc({
            event_type: 'auth',
            event_name: 'login_success',
          });

          span.addEvent('login_successful', { 'user.id': user.id });

          return { userId: user.id, email: user.email };
        } catch (error) {
          span.setAttribute('error', true);
          logger.error('Login error', error as Error, { email, ipAddress });
          throw error;
        }
      },
      {
        'service.name': 'auth-service',
        'operation.type': 'authentication',
      }
    );
  }

  async register(email: string, password: string, organizationId: string) {
    logger.info('User registration attempt', { email, organizationId });

    return await tracer.withSpan('user_registration', async (span) => {
      span.setAttribute('user.email', email);
      span.setAttribute('organization.id', organizationId);

      const startTime = Date.now();

      try {
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
          logger.warn('Registration failed: email already exists', { email });
          throw new Error('Email already registered');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            organizationId,
          },
        });

        const duration = Date.now() - startTime;

        logger.info('User registered successfully', {
          userId: user.id,
          email: user.email,
          duration,
        });

        logger.logBusinessEvent('auth', 'user_registered', {
          userId: user.id,
          email: user.email,
          organizationId,
        });

        metrics.businessEventTotal.inc({
          event_type: 'auth',
          event_name: 'user_registered',
        });

        span.addEvent('user_created', { 'user.id': user.id });

        return user;
      } catch (error) {
        logger.error('Registration error', error as Error, { email });
        throw error;
      }
    });
  }

  private async incrementFailedAttempts(userId: string) {
    // Track failed login attempts
    logger.debug('Incrementing failed login attempts', { userId });

    // Your logic to track failed attempts
    // This could trigger account lockout after N attempts
  }
}
```

### Step 4: Add Database Query Logging

Example: `src/database/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { logger, metrics } from '../observability';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log all queries
prisma.$on('query', (e: any) => {
  const duration = e.duration;

  logger.logDatabaseQuery(e.query, duration, {
    target: e.target,
  });

  // Track slow queries
  if (duration > 1000) {
    logger.warn('Slow database query detected', {
      query: e.query,
      duration,
      target: e.target,
    });
  }

  // Record metrics
  metrics.dbQueryDuration.observe(
    {
      operation: e.query.split(' ')[0], // SELECT, INSERT, etc.
      table: e.target,
    },
    duration / 1000 // Convert to seconds
  );

  metrics.dbQueryTotal.inc({
    operation: e.query.split(' ')[0],
    table: e.target,
  });
});

// Log errors
prisma.$on('error', (e: any) => {
  logger.error('Database error', new Error(e.message), {
    target: e.target,
  });

  metrics.dbQueryErrors.inc({
    operation: 'unknown',
    table: e.target || 'unknown',
    error_type: 'database_error',
  });
});

// Track connection pool
setInterval(() => {
  // Note: Prisma doesn't expose pool metrics directly
  // This is a placeholder - implement based on your setup
  metrics.dbConnectionPoolSize.set(20); // Your pool size
  metrics.dbConnectionPoolUsed.set(10); // Active connections
}, 5000);
```

### Step 5: Add External API Call Logging

Example: `src/integrations/stripe.ts`

```typescript
import { logger, metrics } from '../observability';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCharge(amount: number, currency: string, source: string) {
  const startTime = Date.now();

  try {
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
    });

    const duration = Date.now() - startTime;

    logger.logExternalApiCall('stripe', '/v1/charges', duration, 200, {
      amount,
      currency,
      chargeId: charge.id,
    });

    metrics.externalApiDuration.observe(
      { service: 'stripe', endpoint: '/v1/charges', status_code: '200' },
      duration / 1000
    );

    metrics.externalApiTotal.inc({
      service: 'stripe',
      endpoint: '/v1/charges',
      status_code: '200',
    });

    return charge;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Stripe charge failed', error as Error, {
      amount,
      currency,
      duration,
    });

    metrics.externalApiDuration.observe(
      { service: 'stripe', endpoint: '/v1/charges', status_code: '500' },
      duration / 1000
    );

    metrics.externalApiErrors.inc({
      service: 'stripe',
      endpoint: '/v1/charges',
      error_type: 'api_error',
    });

    throw error;
  }
}
```

### Step 6: Add Cache Metrics

Example: `src/cache/index.ts`

```typescript
import Redis from 'ioredis';
import { logger, metrics } from '../observability';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error('Redis connection error', error);
});

// Wrapper with metrics
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);

    if (value) {
      metrics.cacheHits.inc({ cache_name: 'redis' });
      logger.debug('Cache hit', { key });
      return JSON.parse(value);
    } else {
      metrics.cacheMisses.inc({ cache_name: 'redis' });
      logger.debug('Cache miss', { key });
      return null;
    }
  } catch (error) {
    logger.error('Cache get error', error as Error, { key });
    return null;
  }
}

export async function setCached(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    logger.debug('Cache set', { key, ttl });
  } catch (error) {
    logger.error('Cache set error', error as Error, { key });
  }
}

// Track cache size periodically
setInterval(async () => {
  try {
    const info = await redis.info('memory');
    const match = info.match(/used_memory:(\d+)/);
    if (match) {
      const memoryBytes = parseInt(match[1]);
      metrics.cacheSize.set({ cache_name: 'redis' }, memoryBytes);
    }
  } catch (error) {
    logger.error('Failed to get cache size', error as Error);
  }
}, 10000);
```

### Step 7: Update Environment Variables

Add to `.env`:

```bash
# Service Info
SERVICE_NAME=auth-service
SERVICE_VERSION=1.0.0
NODE_ENV=production

# Logging
LOG_LEVEL=info
ENABLE_PII_MASKING=true

# Tracing
ENABLE_TRACING=true
JAEGER_ENDPOINT=http://localhost:14268/api/traces
TRACE_SAMPLE_RATE=1.0

# Metrics
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🚀 Deployment

### Update Docker Compose

Add environment variables to service definition:

```yaml
services:
  auth-service:
    build: ./services/auth-service
    environment:
      - SERVICE_NAME=auth-service
      - SERVICE_VERSION=1.0.0
      - NODE_ENV=production
      - LOG_LEVEL=info
      - ENABLE_TRACING=true
      - JAEGER_ENDPOINT=http://jaeger:14268/api/traces
      - TRACE_SAMPLE_RATE=1.0
    networks:
      - app-network
      - observability  # Connect to observability network
```

### Update Kubernetes Deployment

Add environment variables to deployment spec:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      containers:
        - name: auth-service
          image: auth-service:1.0.0
          env:
            - name: SERVICE_NAME
              value: "auth-service"
            - name: SERVICE_VERSION
              value: "1.0.0"
            - name: NODE_ENV
              value: "production"
            - name: LOG_LEVEL
              value: "info"
            - name: ENABLE_TRACING
              value: "true"
            - name: JAEGER_ENDPOINT
              value: "http://jaeger-collector:14268/api/traces"
            - name: TRACE_SAMPLE_RATE
              value: "0.1"  # 10% sampling in production
```

## ✅ Verification

### 1. Check Logs

```bash
# Application logs should show:
# - Observability initialization message
# - Structured JSON logs with correlationId
# - Request/response logs
# - Business event logs
```

### 2. Check Metrics

```bash
# Visit service metrics endpoint
curl http://localhost:3001/metrics

# Should see:
# - http_request_duration_seconds
# - http_requests_total
# - db_query_duration_seconds
# - business_events_total
# - etc.
```

### 3. Check Health

```bash
# Health check
curl http://localhost:3001/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "auth-service",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": { "status": "healthy", "responseTime": 15 },
    "redis": { "status": "healthy", "responseTime": 5 }
  }
}
```

### 4. Check Tracing

- Visit Jaeger UI: http://localhost:16686
- Select your service from dropdown
- You should see traces with spans for:
  - HTTP requests
  - Database queries
  - External API calls
  - Custom business operations

### 5. Check Dashboards

- Visit Grafana: http://localhost:3010
- Your service should appear in:
  - Executive Dashboard
  - Service Overview Dashboard
  - Database Dashboard
  - Business Metrics Dashboard

## 📊 Best Practices

### 1. Correlation IDs

Always include correlation ID in logs for request tracing:

```typescript
const correlationId = getCorrelationId();
logger.info('Processing request', { correlationId, userId: user.id });
```

### 2. Structured Logging

Use structured context instead of string interpolation:

```typescript
// Good ✅
logger.info('User created', { userId: user.id, email: user.email });

// Bad ❌
logger.info(`User ${user.id} created with email ${user.email}`);
```

### 3. Meaningful Metrics

Create business-meaningful metrics:

```typescript
// Track business KPIs
metrics.businessEventTotal.inc({
  event_type: 'booking',
  event_name: 'booking_completed',
});

// Track conversion funnel
metrics.businessEventTotal.inc({
  event_type: 'funnel',
  event_name: 'search_initiated',
});
```

### 4. Error Context

Always include relevant context in error logs:

```typescript
try {
  await processPayment(booking);
} catch (error) {
  logger.error('Payment processing failed', error as Error, {
    bookingId: booking.id,
    userId: booking.userId,
    amount: booking.amount,
    paymentMethod: booking.paymentMethod,
  });
  throw error;
}
```

### 5. PII Protection

The logger automatically masks PII, but be mindful:

```typescript
// PII is automatically masked
logger.info('User logged in', {
  email: 'user@example.com', // Will be masked: us***@example.com
  creditCard: '4111111111111111', // Will be masked: ****-****-****-1111
});
```

## 🔧 Troubleshooting

### Issue: Metrics not appearing

**Solution**: Ensure service is added to Prometheus scrape config in `infrastructure/observability/prometheus/prometheus.yml`

### Issue: No correlation IDs in logs

**Solution**: Ensure `correlationMiddleware` is applied before other middleware

### Issue: Traces not appearing in Jaeger

**Solution**: Check `JAEGER_ENDPOINT` environment variable and ensure tracing is enabled

### Issue: Health checks failing

**Solution**: Verify health check functions are properly registered and dependencies are accessible

## 📚 Next Steps

1. Integrate observability into all remaining services
2. Create custom dashboards for service-specific metrics
3. Set up alerting for your specific SLOs
4. Configure production alert routing (PagerDuty, Slack)
5. Implement synthetic monitoring for critical user flows
6. Set up automated performance testing

## 📖 Reference

- [Main Observability README](./infrastructure/observability/README.md)
- [Runbooks](./infrastructure/observability/runbooks/)
- [Grafana Dashboards](./infrastructure/observability/grafana/dashboards/)
