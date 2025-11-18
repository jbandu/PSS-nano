import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3010', 10),
  serviceName: process.env.SERVICE_NAME || 'dcs-service',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '7', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'dcs:',
  },

  socketIo: {
    port: parseInt(process.env.SOCKET_IO_PORT || '3011', 10),
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3009',
    enabled: process.env.ENABLE_SOCKET_IO === 'true',
    pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000', 10),
    pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000', 10),
  },

  services: {
    reservation: process.env.RESERVATION_SERVICE_URL || 'http://localhost:3002',
    inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
    ancillary: process.env.ANCILLARY_SERVICE_URL || 'http://localhost:3006',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  },

  checkIn: {
    openHours: parseInt(process.env.CHECK_IN_OPEN_HOURS || '24', 10),
    closeMinutes: parseInt(process.env.CHECK_IN_CLOSE_MINUTES || '45', 10),
    webCheckIn: process.env.ENABLE_WEB_CHECK_IN === 'true',
    mobileCheckIn: process.env.ENABLE_MOBILE_CHECK_IN === 'true',
    kioskCheckIn: process.env.ENABLE_KIOSK_CHECK_IN === 'true',
    agentCheckIn: process.env.ENABLE_AGENT_CHECK_IN === 'true',
    maxPassengersPerTransaction: parseInt(process.env.MAX_PASSENGERS_PER_TRANSACTION || '9', 10),
    timeoutSeconds: parseInt(process.env.CHECK_IN_TIMEOUT_SECONDS || '300', 10),
  },

  seat: {
    autoAssignment: process.env.ENABLE_AUTO_SEAT_ASSIGNMENT === 'true',
    mapCacheTTL: parseInt(process.env.SEAT_MAP_CACHE_TTL || '60', 10),
    preferredSeating: process.env.ENABLE_PREFERRED_SEATING === 'true',
    blocking: process.env.ENABLE_SEAT_BLOCKING === 'true',
    blockDuration: parseInt(process.env.BLOCK_SEAT_DURATION_MINUTES || '5', 10),
  },

  baggage: {
    tracking: process.env.ENABLE_BAGGAGE_TRACKING === 'true',
    tagPrefix: process.env.BAG_TAG_NUMBER_PREFIX || 'AA',
    tagLength: parseInt(process.env.BAG_TAG_NUMBER_LENGTH || '10', 10),
    bsmEnabled: process.env.ENABLE_IATA_BSM === 'true',
    bsmVersion: process.env.BSM_VERSION || '1.6',
    allowance: {
      economy: parseInt(process.env.BAGGAGE_ALLOWANCE_ECONOMY || '2', 10),
      premium: parseInt(process.env.BAGGAGE_ALLOWANCE_PREMIUM || '3', 10),
      business: parseInt(process.env.BAGGAGE_ALLOWANCE_BUSINESS || '3', 10),
      first: parseInt(process.env.BAGGAGE_ALLOWANCE_FIRST || '4', 10),
    },
    maxWeight: {
      kg: parseInt(process.env.MAX_BAG_WEIGHT_KG || '23', 10),
      lbs: parseInt(process.env.MAX_BAG_WEIGHT_LBS || '50', 10),
    },
    heavyBagFee: parseFloat(process.env.HEAVY_BAG_FEE_USD || '100'),
  },

  bagTag: {
    printing: process.env.ENABLE_BAG_TAG_PRINTING === 'true',
    printerType: process.env.BAG_TAG_PRINTER_TYPE || 'thermal',
    barcodeType: process.env.BAG_TAG_BARCODE_TYPE || 'PDF417',
    paperSize: process.env.BAG_TAG_PAPER_SIZE || '4x6',
    printQueue: process.env.ENABLE_PRINT_QUEUE === 'true',
    dpi: parseInt(process.env.PRINTER_DPI || '300', 10),
  },

  boardingPass: {
    barcodeType: process.env.BOARDING_PASS_BARCODE_TYPE || 'PDF417',
    standard: process.env.BOARDING_PASS_STANDARD || 'IATA_BCBP',
    formatVersion: process.env.BOARDING_PASS_FORMAT_VERSION || 'M',
    mobile: process.env.ENABLE_MOBILE_BOARDING_PASS === 'true',
    paper: process.env.ENABLE_PAPER_BOARDING_PASS === 'true',
    expiryHours: parseInt(process.env.BOARDING_PASS_EXPIRY_HOURS || '24', 10),
  },

  apis: {
    enabled: process.env.ENABLE_APIS === 'true',
    requiredRoutes: (process.env.APIS_REQUIRED_ROUTES || 'US,CA,GB,AU,NZ').split(','),
    mandatoryFields: (process.env.APIS_MANDATORY_FIELDS || '').split(','),
    passportScanning: process.env.ENABLE_PASSPORT_SCANNING === 'true',
    ocr: process.env.ENABLE_OCR === 'true',
    ocrProvider: process.env.OCR_PROVIDER || 'tesseract',
    timaticValidation: process.env.ENABLE_TIMATIC_VALIDATION === 'true',
    timaticUrl: process.env.TIMATIC_API_URL || '',
    timaticKey: process.env.TIMATIC_API_KEY || '',
  },

  government: {
    secureFlight: process.env.ENABLE_SECURE_FLIGHT === 'true',
    secureFlightEndpoint: process.env.SECURE_FLIGHT_ENDPOINT || '',
    caricomImpacs: process.env.ENABLE_CARICOM_IMPACS === 'true',
    impacsEndpoint: process.env.IMPACS_ENDPOINT || '',
    customsDeclaration: process.env.ENABLE_CUSTOMS_DECLARATION === 'true',
    immigrationPreclearance: process.env.ENABLE_IMMIGRATION_PRECLEARANCE === 'true',
  },

  screening: {
    enabled: process.env.ENABLE_WATCHLIST_SCREENING === 'true',
    provider: process.env.WATCHLIST_PROVIDER || 'internal',
    noFlyList: process.env.ENABLE_NO_FLY_LIST === 'true',
    selecteeList: process.env.ENABLE_SELECTEE_LIST === 'true',
    timeout: parseInt(process.env.SCREENING_TIMEOUT_MS || '2000', 10),
    autoClearThreshold: parseInt(process.env.AUTO_CLEAR_THRESHOLD || '95', 10),
  },

  ssr: {
    enabled: process.env.ENABLE_SSR === 'true',
    supportedCodes: (process.env.SUPPORTED_SSR_CODES || '').split(','),
    validation: process.env.ENABLE_SSR_VALIDATION === 'true',
    forwarding: process.env.ENABLE_SSR_FORWARDING === 'true',
  },

  payment: {
    enabled: process.env.ENABLE_CHECK_IN_PAYMENTS === 'true',
    acceptedMethods: (process.env.ACCEPTED_PAYMENT_METHODS || 'card,cash,voucher').split(','),
    baggageFees: process.env.ENABLE_BAGGAGE_FEES === 'true',
    seatFees: process.env.ENABLE_SEAT_FEES === 'true',
    upgradeFees: process.env.ENABLE_UPGRADE_FEES === 'true',
    ancillarySales: process.env.ENABLE_ANCILLARY_SALES === 'true',
    timeout: parseInt(process.env.PAYMENT_TIMEOUT_SECONDS || '120', 10),
  },

  performance: {
    targetCheckInTime: parseInt(process.env.TARGET_CHECK_IN_TIME_SECONDS || '5', 10),
    targetSeatMapLoad: parseInt(process.env.TARGET_SEAT_MAP_LOAD_TIME_MS || '500', 10),
    targetPassengerLookup: parseInt(process.env.TARGET_PASSENGER_LOOKUP_TIME_MS || '1000', 10),
    targetConcurrentAgents: parseInt(process.env.TARGET_CONCURRENT_AGENTS || '100', 10),
    metricsEnabled: process.env.ENABLE_PERFORMANCE_METRICS === 'true',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3009').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  security: {
    helmet: process.env.ENABLE_HELMET === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    auditLog: process.env.ENABLE_AUDIT_LOG === 'true',
    auditRetention: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '730', 10),
    logPiiAccess: process.env.LOG_PII_ACCESS === 'true',
  },

  monitoring: {
    metrics: process.env.ENABLE_METRICS === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT || '9010', 10),
    healthCheck: process.env.ENABLE_HEALTH_CHECK === 'true',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    checkInTransactions: process.env.LOG_CHECK_IN_TRANSACTIONS === 'true',
    baggageOperations: process.env.LOG_BAGGAGE_OPERATIONS === 'true',
    apisSubmissions: process.env.LOG_APIS_SUBMISSIONS === 'true',
  },
};
