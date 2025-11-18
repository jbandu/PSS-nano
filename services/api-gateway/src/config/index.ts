import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Slow Down (gradual response delay)
  slowDown: {
    windowMs: parseInt(process.env.SLOW_DOWN_WINDOW_MS || '60000', 10),
    delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER || '500', 10),
    delayMs: parseInt(process.env.SLOW_DOWN_DELAY_MS || '500', 10),
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Monitoring
  monitoring: {
    metricsPath: '/metrics',
    healthPath: '/health',
    readinessPath: '/ready',
    livenessPath: '/live',
  },

  // Consul Configuration (for service discovery)
  consul: {
    enabled: process.env.CONSUL_ENABLED === 'true',
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  },

  // Request Configuration
  request: {
    maxBodySize: process.env.MAX_BODY_SIZE || '10mb',
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  },

  // Circuit Breaker Defaults
  circuitBreaker: {
    enabled: process.env.CIRCUIT_BREAKER_ENABLED !== 'false',
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5', 10),
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '10000', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),
  },
};

export default config;
