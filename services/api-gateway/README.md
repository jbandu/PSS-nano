# API Gateway Service

Central entry point for all microservices in the Airline Operational Intelligence Platform. Provides unified API access, authentication, rate limiting, circuit breaker pattern, and comprehensive monitoring.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Circuit Breaker](#circuit-breaker)
- [Monitoring](#monitoring)
- [Service Registry](#service-registry)
- [Development](#development)
- [Docker](#docker)
- [Production](#production)

## Overview

The API Gateway serves as the single entry point for all client requests, providing:

- **Unified API** - Single endpoint for all microservices
- **Authentication & Authorization** - JWT, API keys, OAuth 2.0
- **Rate Limiting** - Prevent abuse and ensure fair usage
- **Circuit Breaker** - Fault tolerance and graceful degradation
- **Request Routing** - Intelligent routing to backend services
- **Load Balancing** - Distribute load across service instances
- **Monitoring** - Prometheus metrics and health checks
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Request/Response Logging** - Complete audit trail
- **Compression** - Reduced bandwidth usage

## Features

### Security

- **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** - Configurable cross-origin resource sharing
- **JWT Validation** - Stateless authentication
- **API Key Management** - Partner and service-to-service auth
- **OAuth 2.0 Support** - Google, GitHub, Facebook, Microsoft
- **RBAC** - Role-based access control
- **Permission Scopes** - Granular access control
- **Multi-tenant Isolation** - Organization-level data isolation

### Resilience

- **Circuit Breaker** - Prevent cascading failures using Opossum
- **Automatic Retries** - Configurable retry logic per service
- **Timeout Management** - Service-specific timeout configuration
- **Health Checks** - Periodic health monitoring of backend services
- **Graceful Degradation** - Continue operating with partial failures

### Performance

- **Response Compression** - Gzip compression for all responses
- **Connection Pooling** - Efficient HTTP connection management
- **Request Caching** - Optional response caching (future)
- **Rate Limiting** - 1000 req/min per client (configurable)
- **Slow Down** - Gradual response delay for high-frequency clients

### Observability

- **Prometheus Metrics** - Request duration, error rates, circuit breaker stats
- **Correlation IDs** - Request tracing across services
- **Structured Logging** - JSON logs with Winston
- **Daily Log Rotation** - Automatic log file management
- **Health Endpoints** - `/health`, `/ready`, `/live`
- **Service Status** - Real-time backend service health

## Architecture

```
┌─────────────┐
│   Clients   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          API Gateway (Port 3000)        │
│  ┌───────────────────────────────────┐  │
│  │  Security & Rate Limiting Layer   │  │
│  │  - Helmet, CORS, Rate Limit       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Authentication & Authorization   │  │
│  │  - JWT, API Keys, OAuth 2.0       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Service Registry & Routing       │  │
│  │  - Dynamic routing, Load balancer │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Circuit Breaker & Resilience     │  │
│  │  - Fault tolerance, Retries       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Monitoring & Logging             │  │
│  │  - Metrics, Tracing, Audit logs   │  │
│  └───────────────────────────────────┘  │
└───────────┬─────────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌────────┐      ┌────────────┐
│  Auth  │      │Reservation │
│Service │      │  Service   │
│ :3001  │      │   :3002    │
└────────┘      └────────────┘
    │               │
    ▼               ▼
┌────────┐      ┌────────────┐
│Inventory│     │  Payment   │
│Service │      │  Service   │
│ :3003  │      │   :3004    │
└────────┘      └────────────┘
    │               │
    ▼               ▼
┌────────┐      ┌────────────┐
│ Flight │      │Notification│
│Service │      │  Service   │
│ :3006  │      │   :3005    │
└────────┘      └────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Backend services running (auth, reservation, etc.)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Development

```bash
# Run in development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run built application
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Access Points

Once running:

- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

#### Critical Settings

```env
# Production secret - must be changed!
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs
AUTH_URL=http://auth-service:3001
RESERVATION_URL=http://reservation-service:3002
INVENTORY_URL=http://inventory-service:3003
PAYMENT_URL=http://payment-service:3004
NOTIFICATION_URL=http://notification-service:3005
FLIGHT_URL=http://flight-service:3006
```

#### Rate Limiting

```env
# 1000 requests per minute per client
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000
```

#### Circuit Breaker

```env
# Enable circuit breaker
CIRCUIT_BREAKER_ENABLED=true

# Open circuit after 5 failures
CIRCUIT_BREAKER_THRESHOLD=5

# Request timeout (ms)
CIRCUIT_BREAKER_TIMEOUT=10000

# Reset timeout (ms)
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
```

### Service Registry

Services are registered in `src/config/services.config.ts`:

```typescript
export const serviceRegistry: ServiceRegistry = {
  auth: {
    name: 'auth-service',
    url: getServiceUrl('auth', '3001'),
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
    circuitBreaker: { /* config */ },
  },
  // ... other services
};
```

To add a new service:

1. Add entry to `serviceRegistry`
2. Add route in `src/routes/api.routes.ts`
3. Update Swagger documentation

## API Documentation

### Swagger/OpenAPI

Interactive API documentation is available at `/api-docs`:

```
http://localhost:3000/api-docs
```

Features:
- Browse all endpoints
- Try API calls directly from browser
- View request/response schemas
- Authentication testing

### OpenAPI Specification

JSON specification available at:

```
http://localhost:3000/api-docs.json
```

## Authentication

### JWT Authentication

Most endpoints require JWT token authentication.

**Login to get token:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@skylineairways.com",
    "password": "Admin123!"
  }'
```

**Use token in requests:**

```bash
curl http://localhost:3000/api/v1/reservations \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Token format:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "organizationId": "org-uuid",
  "permissions": ["booking:read", "booking:write"]
}
```

### API Key Authentication

For service-to-service or partner integrations:

```bash
curl http://localhost:3000/api/v1/flights \
  -H "X-API-Key: your-api-key"
```

API keys support scoped permissions:
- `booking:read`, `booking:write`
- `inventory:read`, `inventory:write`
- `payment:read`, `payment:write`
- `*` (wildcard - full access)

### OAuth 2.0

Supports third-party authentication:
- Google
- GitHub
- Facebook
- Microsoft

**Configuration required in `.env`:**

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Rate Limiting

### Default Limits

- **1000 requests per minute** per client IP
- **500 requests per minute** before slowdown kicks in

### Response Headers

Rate limit info included in all responses:

```
RateLimit-Limit: 1000
RateLimit-Remaining: 823
RateLimit-Reset: 1640000000
```

### 429 Too Many Requests

When limit exceeded:

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Custom Rate Limits

Configure per service in route definitions:

```typescript
router.use('/expensive-operation', rateLimit({
  windowMs: 60000,
  max: 10, // Only 10 requests per minute
}));
```

## Circuit Breaker

### Purpose

Prevents cascading failures by:
1. Detecting service failures
2. Opening circuit after threshold
3. Rejecting requests while circuit is open
4. Periodically testing if service recovered

### States

- **CLOSED** - Normal operation, requests pass through
- **OPEN** - Service unhealthy, requests immediately fail
- **HALF_OPEN** - Testing if service recovered

### Configuration

Per service in `services.config.ts`:

```typescript
circuitBreaker: {
  enabled: true,
  threshold: 5,        // Open after 5 failures
  timeout: 10000,      // Request timeout (10s)
  resetTimeout: 30000, // Try to close after 30s
}
```

### Monitoring

View circuit breaker status:

```bash
curl http://localhost:3000/health/circuit-breakers
```

Response:

```json
{
  "circuitBreakers": {
    "auth-service": {
      "state": "CLOSED",
      "stats": {
        "fires": 1523,
        "failures": 2,
        "successes": 1521
      }
    }
  }
}
```

### Manual Reset

Reset a circuit breaker:

```typescript
import { circuitBreakerManager } from './services/circuit-breaker.service';

// Reset specific service
circuitBreakerManager.reset('auth-service');

// Reset all
circuitBreakerManager.resetAll();
```

## Monitoring

### Health Checks

**Gateway Health:**

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 3600,
  "services": [
    {
      "service": "auth-service",
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2024-01-15T12:00:00.000Z"
    }
  ],
  "version": "1.0.0"
}
```

**Service Health:**

```bash
curl http://localhost:3000/health/services
```

**Kubernetes Probes:**

- **Readiness**: `/ready` - Is gateway ready to accept traffic?
- **Liveness**: `/live` - Is gateway process alive?

### Prometheus Metrics

Available at `/metrics`:

```bash
curl http://localhost:3000/metrics
```

**Key Metrics:**

```
# Request duration histogram
http_request_duration_seconds{method="GET",route="/api/v1/reservations",status_code="200"}

# Request counter
http_requests_total{method="POST",route="/api/v1/auth/login",status_code="200"}

# Error counter
http_errors_total{method="GET",route="/api/v1/flights",status_code="500"}

# Service health gauge (1=healthy, 0=unhealthy)
service_health_status{service="auth-service"} 1

# Circuit breaker state (0=closed, 1=open, 2=half-open)
circuit_breaker_state{service="reservation-service"} 0

# Active connections
active_connections 42
```

**Scrape Configuration:**

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'api-gateway'
    scrape_interval: 15s
    static_configs:
      - targets: ['api-gateway:3000']
```

### Logging

**Structured JSON logs** written to:

- `logs/combined-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Errors only
- Console - Development output

**Log Format:**

```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2024-01-15 12:00:00",
  "service": "api-gateway",
  "correlationId": "uuid",
  "userId": "user-uuid",
  "method": "GET",
  "path": "/api/v1/reservations",
  "statusCode": 200,
  "duration": 145
}
```

**Correlation IDs:**

Every request gets a unique correlation ID for distributed tracing:

```
X-Correlation-ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Service Registry

### Dynamic Service Discovery

Services can be registered dynamically using Consul (optional):

```env
CONSUL_ENABLED=true
CONSUL_HOST=localhost
CONSUL_PORT=8500
```

### Static Configuration

Services are statically configured in `services.config.ts`:

```typescript
export const serviceRegistry = {
  'service-name': {
    name: 'service-name',
    url: 'http://service-host:port',
    healthCheck: '/health',
    timeout: 5000,
    retries: 3,
  }
};
```

### Health Monitoring

Gateway automatically monitors service health every 30 seconds:

```typescript
healthCheckService.start(); // Starts periodic checks
```

Services marked unhealthy will:
- Show in health endpoint as degraded
- Trigger circuit breaker if failures continue
- Log warnings for investigation

## Development

### Project Structure

```
api-gateway/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts           # Main config
│   │   ├── services.config.ts # Service registry
│   │   └── swagger.config.ts  # API documentation
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── proxy.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/          # API routes
│   │   ├── api.routes.ts
│   │   ├── health.routes.ts
│   │   └── metrics.routes.ts
│   ├── services/        # Business logic
│   │   ├── circuit-breaker.service.ts
│   │   └── health-check.service.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   ├── correlation.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── metrics.ts
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── logs/                # Log files
├── .env.example         # Environment template
├── Dockerfile           # Docker image
├── package.json
├── tsconfig.json
└── README.md
```

### Adding a New Route

1. **Update service registry** (`src/config/services.config.ts`):

```typescript
export const serviceRegistry = {
  // ... existing services
  analytics: {
    name: 'analytics-service',
    url: getServiceUrl('analytics', '3007'),
    healthCheck: '/health',
    timeout: 8000,
    retries: 3,
  },
};
```

2. **Add route** (`src/routes/api.routes.ts`):

```typescript
router.use(
  '/analytics/*',
  authenticateJWT,
  measureResponseTime('analytics-service'),
  checkCircuitBreaker(serviceRegistry.analytics),
  createServiceProxy(serviceRegistry.analytics)
);
```

3. **Update Swagger docs** (`src/config/swagger.config.ts`):

```typescript
tags: [
  // ... existing tags
  { name: 'Analytics', description: 'Analytics and reporting' },
],
```

### Testing

**Manual Testing:**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skylineairways.com","password":"Admin123!"}'

# Test authenticated endpoint
curl http://localhost:3000/api/v1/reservations \
  -H "Authorization: Bearer <token>"
```

**Load Testing:**

```bash
# Using Apache Bench
ab -n 10000 -c 100 http://localhost:3000/health

# Using k6
k6 run load-test.js
```

## Docker

### Build Image

```bash
docker build -t api-gateway:latest .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e AUTH_URL=http://auth-service:3001 \
  --name api-gateway \
  api-gateway:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_URL=http://auth-service:3001
      - RESERVATION_URL=http://reservation-service:3002
    depends_on:
      - auth-service
      - reservation-service
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 5s
      retries: 3
```

## Production

### Deployment Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure production service URLs
- [ ] Set appropriate rate limits
- [ ] Enable CORS for production domains only
- [ ] Configure log aggregation (ELK, Datadog, etc.)
- [ ] Set up Prometheus scraping
- [ ] Configure health check monitoring
- [ ] Set up SSL/TLS termination (load balancer)
- [ ] Configure auto-scaling based on metrics
- [ ] Set up alerting for circuit breaker events
- [ ] Review timeout and retry settings
- [ ] Enable request compression
- [ ] Configure rate limiting per client tier

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-gateway-secret
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /live
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Scaling

**Horizontal Scaling:**

```bash
# Kubernetes
kubectl scale deployment api-gateway --replicas=5

# Docker Swarm
docker service scale api-gateway=5
```

**Metrics to Monitor:**
- CPU usage
- Memory usage
- Request latency (p50, p95, p99)
- Error rate
- Circuit breaker state changes
- Active connections

### Security Best Practices

1. **Use HTTPS** - TLS termination at load balancer
2. **Rotate Secrets** - Regular JWT secret rotation
3. **Rate Limiting** - Prevent DDoS and abuse
4. **Input Validation** - Validate all incoming requests
5. **Security Headers** - Helmet.js configuration
6. **API Versioning** - Allow breaking changes gracefully
7. **Audit Logging** - Log all authentication attempts
8. **CORS Whitelist** - Strict origin validation

## Troubleshooting

### Circuit Breaker Keeps Opening

**Symptoms:** Requests fail with 503 Service Unavailable

**Solutions:**
1. Check backend service health: `curl http://localhost:3000/health/services`
2. Review circuit breaker stats: `curl http://localhost:3000/health/circuit-breakers`
3. Check service logs for errors
4. Manually reset circuit: `circuitBreakerManager.reset('service-name')`
5. Adjust threshold if too sensitive

### High Latency

**Symptoms:** Slow response times

**Solutions:**
1. Check Prometheus metrics for slow services
2. Review service timeout settings
3. Enable response compression if not already
4. Check for n+1 query problems in backend services
5. Consider adding caching layer

### Rate Limiting False Positives

**Symptoms:** Legitimate users hit rate limits

**Solutions:**
1. Increase rate limit: `RATE_LIMIT_MAX=2000`
2. Adjust time window: `RATE_LIMIT_WINDOW_MS=120000`
3. Implement IP whitelisting for trusted clients
4. Use API keys with higher limits for partners

### Memory Leaks

**Symptoms:** Memory usage grows over time

**Solutions:**
1. Review log rotation settings
2. Check for unclosed connections to backend services
3. Monitor with `/live` endpoint memory stats
4. Review circuit breaker cleanup
5. Restart gateway periodically in production

## Contributing

When contributing to the API Gateway:

1. Follow TypeScript strict mode guidelines
2. Add JSDoc comments for public APIs
3. Update Swagger documentation for new endpoints
4. Add tests for new middleware
5. Update this README with configuration changes
6. Ensure all health checks pass

## License

Proprietary - All rights reserved
