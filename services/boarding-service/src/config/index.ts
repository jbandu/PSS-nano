import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3011', 10),
  serviceName: process.env.SERVICE_NAME || 'boarding-service',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '8', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'boarding:',
  },

  socketIo: {
    port: parseInt(process.env.SOCKET_IO_PORT || '3012', 10),
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
    enabled: process.env.ENABLE_SOCKET_IO === 'true',
    pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000', 10),
    pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000', 10),
  },

  services: {
    dcs: process.env.DCS_SERVICE_URL || 'http://localhost:3010',
    reservation: process.env.RESERVATION_SERVICE_URL || 'http://localhost:3002',
    inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
  },

  boarding: {
    targetScanProcessingTime: parseInt(process.env.TARGET_SCAN_PROCESSING_TIME_MS || '2000', 10),
    duplicatePrevention: process.env.ENABLE_DUPLICATE_PREVENTION === 'true',
    duplicateScanTimeout: parseInt(process.env.DUPLICATE_SCAN_TIMEOUT_SECONDS || '300', 10),
    seatVerification: process.env.ENABLE_SEAT_VERIFICATION === 'true',
    priorityEnforcement: process.env.ENABLE_PRIORITY_ENFORCEMENT === 'true',
    specialNeedsFlagging: process.env.ENABLE_SPECIAL_NEEDS_FLAGGING === 'true',
  },

  zones: {
    enabled: process.env.ENABLE_ZONE_BASED_BOARDING === 'true',
    defaultZones: parseInt(process.env.DEFAULT_BOARDING_ZONES || '5', 10),
    zoneSequence: (process.env.ZONE_SEQUENCE || 'premium,elite,priority,general,basic').split(','),
    familyBoarding: process.env.ENABLE_FAMILY_BOARDING === 'true',
    familyBoardingZone: parseInt(process.env.FAMILY_BOARDING_ZONE || '2', 10),
  },

  priority: {
    groups: (process.env.PRIORITY_GROUPS || 'first,business,premium_economy,elite_platinum,elite_gold,elite_silver,disability,family,military').split(','),
    firstClassZone: parseInt(process.env.FIRST_CLASS_ZONE || '1', 10),
    businessClassZone: parseInt(process.env.BUSINESS_CLASS_ZONE || '1', 10),
    premiumEconomyZone: parseInt(process.env.PREMIUM_ECONOMY_ZONE || '2', 10),
    disabilityPriority: process.env.DISABILITY_PRIORITY === 'true',
    militaryPriority: process.env.MILITARY_PRIORITY === 'true',
  },

  gate: {
    lastMinuteSeatChanges: process.env.ENABLE_LAST_MINUTE_SEAT_CHANGES === 'true',
    standbyProcessing: process.env.ENABLE_STANDBY_PROCESSING === 'true',
    gateUpgrades: process.env.ENABLE_GATE_UPGRADES === 'true',
    weightBalanceCheck: process.env.ENABLE_WEIGHT_BALANCE_CHECK === 'true',
    doorClosureCoordination: process.env.ENABLE_DOOR_CLOSURE_COORDINATION === 'true',
    doorClosureWarningMinutes: parseInt(process.env.DOOR_CLOSURE_WARNING_MINUTES || '10', 10),
  },

  analytics: {
    enabled: process.env.ENABLE_BOARDING_ANALYTICS === 'true',
    trackBoardingSpeed: process.env.TRACK_BOARDING_SPEED === 'true',
    trackZoneEffectiveness: process.env.TRACK_ZONE_EFFECTIVENESS === 'true',
    trackBottlenecks: process.env.TRACK_BOTTLENECKS === 'true',
    samplingRate: parseFloat(process.env.ANALYTICS_SAMPLING_RATE || '1.0'),
  },

  performance: {
    targetBoardingTime: parseInt(process.env.TARGET_BOARDING_TIME_MINUTES || '25', 10),
    targetPassengersPerMinute: parseInt(process.env.TARGET_PASSENGERS_PER_MINUTE || '8', 10),
    earlyBoardingMinutes: parseInt(process.env.EARLY_BOARDING_MINUTES || '40', 10),
    finalCallMinutes: parseInt(process.env.FINAL_CALL_MINUTES || '15', 10),
  },

  biometric: {
    enabled: process.env.ENABLE_BIOMETRIC_BOARDING === 'false',
    provider: process.env.BIOMETRIC_PROVIDER || 'vision_box',
    confidenceThreshold: parseFloat(process.env.BIOMETRIC_CONFIDENCE_THRESHOLD || '0.95'),
    touchlessBoarding: process.env.ENABLE_TOUCHLESS_BOARDING === 'false',
    documentVerification: process.env.ENABLE_DOCUMENT_VERIFICATION === 'true',
    fallbackEnabled: process.env.BIOMETRIC_FALLBACK_ENABLED === 'true',
  },

  hardware: {
    supportedBarcodeFormats: (process.env.SUPPORTED_BARCODE_FORMATS || 'PDF417,QR_CODE,CODE_128,AZTEC').split(','),
    enable1D: process.env.ENABLE_1D_BARCODES === 'true',
    enable2D: process.env.ENABLE_2D_BARCODES === 'true',
    bcbpFormatVersion: process.env.IATA_BCBP_FORMAT_VERSION || 'M',
    strictValidation: process.env.BARCODE_VALIDATION_STRICT === 'true',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  security: {
    helmet: process.env.ENABLE_HELMET === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    auditLog: process.env.ENABLE_AUDIT_LOG === 'true',
    auditRetention: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '365', 10),
    logAllScans: process.env.LOG_ALL_SCANS === 'true',
  },

  monitoring: {
    metrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9011', 10),
    healthCheck: process.env.ENABLE_HEALTH_CHECK === 'true',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    boardingEvents: process.env.LOG_BOARDING_EVENTS === 'true',
    gateOperations: process.env.LOG_GATE_OPERATIONS === 'true',
    scanTransactions: process.env.LOG_SCAN_TRANSACTIONS === 'true',
  },
};
