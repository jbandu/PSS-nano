import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  serviceName: process.env.SERVICE_NAME || 'auth-service',

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-change-me',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3', 10),
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000', 10),
    passwordResetExpires: parseInt(process.env.PASSWORD_RESET_EXPIRES || '3600000', 10),
    enable2FA: process.env.ENABLE_2FA === 'true',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@airline-ops.com',
  },

  // OAuth 2.0
  oauth: {
    authorizationCodeExpiresIn: parseInt(
      process.env.OAUTH_AUTHORIZATION_CODE_EXPIRES_IN || '600',
      10
    ),
    accessTokenExpiresIn: parseInt(process.env.OAUTH_ACCESS_TOKEN_EXPIRES_IN || '3600', 10),
    refreshTokenExpiresIn: parseInt(process.env.OAUTH_REFRESH_TOKEN_EXPIRES_IN || '2592000', 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    loginMaxRequests: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
    loginWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW || '900000', 10),
  },

  // API Keys
  apiKey: {
    prefix: process.env.API_KEY_PREFIX || 'ak_',
    length: parseInt(process.env.API_KEY_LENGTH || '32', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

export default config;
