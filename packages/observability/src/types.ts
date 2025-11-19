export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

export interface LoggerConfig {
  serviceName: string;
  environment: Environment;
  logLevel?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  enableLoki?: boolean;
  lokiUrl?: string;
  enablePIIMasking?: boolean;
  correlationIdEnabled?: boolean;
}

export interface TracingConfig {
  serviceName: string;
  environment: Environment;
  jaegerEndpoint?: string;
  sampleRate?: number;
  enabled?: boolean;
}

export interface MetricsConfig {
  serviceName: string;
  environment: Environment;
  enabled?: boolean;
  port?: number;
  path?: string;
  collectDefaultMetrics?: boolean;
}

export interface ObservabilityConfig {
  logger: LoggerConfig;
  tracing: TracingConfig;
  metrics: MetricsConfig;
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export interface BusinessEvent {
  eventType: string;
  eventName: string;
  timestamp: Date;
  userId?: string;
  organizationId?: string;
  metadata: Record<string, any>;
}

export interface SecurityEvent {
  eventType: 'auth_failure' | 'unauthorized_access' | 'data_access' | 'fraud_indicator' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  details: Record<string, any>;
}
