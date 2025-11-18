import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import { swaggerSpec } from './config/swagger.config';
import { correlationIdMiddleware } from './utils/correlation';
import { metricsMiddleware } from './utils/metrics';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware';
import logger from './utils/logger';

// Import routes
import healthRoutes from './routes/health.routes';
import metricsRoutes from './routes/metrics.routes';
import apiRoutes from './routes/api.routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Trust proxy (for rate limiting, CORS, etc.)
  app.set('trust proxy', 1);

  // ==================== Security Middleware ====================

  // Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // CORS - Cross-Origin Resource Sharing
  app.use(cors(config.cors));

  // ==================== Request Processing ====================

  // Body parsing
  app.use(express.json({ limit: config.request.maxBodySize }));
  app.use(express.urlencoded({ extended: true, limit: config.request.maxBodySize }));

  // Compression
  app.use(compression());

  // ==================== Logging & Monitoring ====================

  // Correlation ID
  app.use(correlationIdMiddleware);

  // HTTP request logging
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    })
  );

  // Metrics collection
  app.use(metricsMiddleware);

  // ==================== Rate Limiting ====================

  // Rate limiter - Hard limit
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: config.rateLimit.standardHeaders,
    legacyHeaders: config.rateLimit.legacyHeaders,
    message: {
      status: 'error',
      statusCode: 429,
      message: 'Too many requests, please try again later',
    },
    // Skip rate limiting for health checks
    skip: (req) => req.path.startsWith('/health') || req.path.startsWith('/metrics'),
  });

  app.use(limiter);

  // Speed limiter - Gradual slowdown
  const speedLimiter = slowDown({
    windowMs: config.slowDown.windowMs,
    delayAfter: config.slowDown.delayAfter,
    delayMs: config.slowDown.delayMs,
    // Skip for health checks
    skip: (req) => req.path.startsWith('/health') || req.path.startsWith('/metrics'),
  });

  app.use(speedLimiter);

  // ==================== API Documentation ====================

  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Airline Operations API Gateway',
    })
  );

  // Swagger JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ==================== Routes ====================

  // Health and monitoring routes
  app.use('/', healthRoutes);
  app.use('/', metricsRoutes);

  // API routes (with versioning)
  app.use(config.apiPrefix, apiRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Airline Operations API Gateway',
      version: process.env.npm_package_version || '1.0.0',
      status: 'running',
      documentation: '/api-docs',
      health: '/health',
      metrics: '/metrics',
    });
  });

  // ==================== Error Handling ====================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
