import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerConfig, LogLevel, LogContext } from './types';
import { maskPII } from './utils/pii-masking';
import { getCorrelationId } from './utils/correlation';

const LOG_RETENTION_DAYS = 30;
const LOG_MAX_SIZE = '100m';

export class Logger {
  private logger: winston.Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = {
      logLevel: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      enablePIIMasking: true,
      correlationIdEnabled: true,
      ...config
    };

    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(this.formatLog.bind(this))
          )
        })
      );
    }

    // File transport with rotation
    if (this.config.enableFile) {
      const fileTransport = new DailyRotateFile({
        filename: this.config.filePath || `logs/${this.config.serviceName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: LOG_MAX_SIZE,
        maxFiles: `${LOG_RETENTION_DAYS}d`,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      });

      transports.push(fileTransport);
    }

    return winston.createLogger({
      level: this.config.logLevel,
      defaultMeta: {
        service: this.config.serviceName,
        environment: this.config.environment,
        version: process.env.SERVICE_VERSION || '1.0.0',
        hostname: process.env.HOSTNAME || 'unknown'
      },
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: `logs/${this.config.serviceName}-exceptions.log` })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: `logs/${this.config.serviceName}-rejections.log` })
      ]
    });
  }

  private formatLog(info: any): string {
    const { timestamp, level, message, service, ...meta } = info;
    const correlationId = meta.correlationId || 'N/A';
    return `${timestamp} [${service}] [${correlationId}] ${level}: ${message} ${
      Object.keys(meta).length > 1 ? JSON.stringify(meta) : ''
    }`;
  }

  private enrichContext(context?: LogContext): LogContext {
    const enriched: LogContext = {
      ...context,
      timestamp: new Date().toISOString()
    };

    if (this.config.correlationIdEnabled) {
      enriched.correlationId = context?.correlationId || getCorrelationId();
    }

    return enriched;
  }

  private sanitizeData(data: any): any {
    if (!this.config.enablePIIMasking) {
      return data;
    }
    return maskPII(data);
  }

  debug(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(this.enrichContext(context));
    this.logger.debug(message, sanitizedContext);
  }

  info(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(this.enrichContext(context));
    this.logger.info(message, sanitizedContext);
  }

  warn(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(this.enrichContext(context));
    this.logger.warn(message, sanitizedContext);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(this.enrichContext(context));
    this.logger.error(message, {
      ...sanitizedContext,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...error
      } : undefined
    });
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(this.enrichContext(context));
    this.logger.error(`[FATAL] ${message}`, {
      ...sanitizedContext,
      severity: 'fatal',
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...error
      } : undefined
    });
  }

  // Specialized logging methods
  logRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`${method} ${path} ${statusCode} ${duration}ms`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
      type: 'http_request'
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext): void {
    const isSlowQuery = duration > 1000; // > 1 second
    const level = isSlowQuery ? 'warn' : 'debug';

    this.logger.log(level, `Database query executed in ${duration}ms`, {
      ...this.enrichContext(context),
      query: this.sanitizeData(query),
      duration,
      isSlowQuery,
      type: 'database_query'
    });
  }

  logExternalApiCall(service: string, endpoint: string, duration: number, statusCode: number, context?: LogContext): void {
    const isError = statusCode >= 400;
    const level = isError ? 'error' : 'info';

    this.logger.log(level, `External API call to ${service}`, {
      ...this.enrichContext(context),
      service,
      endpoint,
      duration,
      statusCode,
      type: 'external_api_call'
    });
  }

  logBusinessEvent(eventType: string, eventName: string, metadata: Record<string, any>, context?: LogContext): void {
    this.info(`Business event: ${eventName}`, {
      ...context,
      eventType,
      eventName,
      metadata: this.sanitizeData(metadata),
      type: 'business_event'
    });
  }

  logSecurityEvent(eventType: string, severity: string, details: Record<string, any>, context?: LogContext): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';

    this.logger.log(level, `Security event: ${eventType}`, {
      ...this.enrichContext(context),
      eventType,
      severity,
      details: this.sanitizeData(details),
      type: 'security_event'
    });
  }

  child(metadata: Record<string, any>): Logger {
    const childLogger = Object.create(this);
    childLogger.logger = this.logger.child(metadata);
    return childLogger;
  }
}

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}
