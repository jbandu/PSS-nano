import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10),
  serviceName: process.env.SERVICE_NAME || 'inventory-service',

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '1', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'inv:',
    defaultTTL: parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10),
  },

  // RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'airline_events',
    queueInventory: process.env.RABBITMQ_QUEUE_INVENTORY || 'inventory_updates',
    queueLowInventory: process.env.RABBITMQ_QUEUE_LOW_INVENTORY || 'low_inventory_alerts',
  },

  // Cache
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    hitRateTarget: parseFloat(process.env.CACHE_HIT_RATE_TARGET || '0.85'),
    availabilityTTL: parseInt(process.env.CACHE_AVAILABILITY_TTL || '300', 10),
    scheduleTTL: parseInt(process.env.CACHE_SCHEDULE_TTL || '3600', 10),
    inventoryTTL: parseInt(process.env.CACHE_INVENTORY_TTL || '60', 10),
  },

  // Inventory
  inventory: {
    lockDuration: parseInt(process.env.INVENTORY_LOCK_DURATION || '300', 10),
    overbookingEnabled: process.env.OVERBOOKING_ENABLED === 'true',
    overbookingDefaultPercentage: parseInt(process.env.OVERBOOKING_DEFAULT_PERCENTAGE || '10', 10),
    lowInventoryThreshold: parseInt(process.env.LOW_INVENTORY_THRESHOLD || '5', 10),
    syncInterval: parseInt(process.env.INVENTORY_SYNC_INTERVAL || '60000', 10),
  },

  // Performance
  performance: {
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '500', 10),
    cacheQueryTimeout: parseInt(process.env.CACHE_QUERY_TIMEOUT || '100', 10),
    maxConcurrentSearches: parseInt(process.env.MAX_CONCURRENT_SEARCHES || '100', 10),
    searchDateRangeDays: parseInt(process.env.SEARCH_DATE_RANGE_DAYS || '3', 10),
  },

  // Business Rules
  businessRules: {
    advancePurchaseMinDays: parseInt(process.env.ADVANCE_PURCHASE_MIN_DAYS || '0', 10),
    advancePurchaseMaxDays: parseInt(process.env.ADVANCE_PURCHASE_MAX_DAYS || '365', 10),
    bookingWindowMinHours: parseInt(process.env.BOOKING_WINDOW_MIN_HOURS || '2', 10),
    maxStayDays: parseInt(process.env.MAX_STAY_DAYS || '365', 10),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    searchMaxRequests: parseInt(process.env.SEARCH_RATE_LIMIT_MAX || '30', 10),
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

  // Monitoring
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT || '9003', 10),
  },

  // Webhooks
  webhooks: {
    lowInventoryUrl: process.env.WEBHOOK_LOW_INVENTORY_URL || '',
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '5000', 10),
    retryCount: parseInt(process.env.WEBHOOK_RETRY_COUNT || '3', 10),
  },
};

export default config;
