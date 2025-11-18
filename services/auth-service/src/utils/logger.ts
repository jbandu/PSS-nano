import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, service, ...metadata }) => {
  let msg = `${timestamp} [${level}] [${service}]`;

  if (metadata.correlationId) {
    msg += ` [${metadata.correlationId}]`;
  }

  msg += `: ${message}`;

  if (Object.keys(metadata).length > 1) {
    const filteredMeta = { ...metadata };
    delete filteredMeta.correlationId;
    msg += ` ${JSON.stringify(filteredMeta)}`;
  }

  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), config.env === 'development' ? customFormat : json()),
  defaultMeta: { service: config.serviceName },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
    }),

    // File transport for errors
    new DailyRotateFile({
      filename: `${config.logging.dir}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: json(),
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: `${config.logging.dir}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: json(),
    }),

    // File transport for audit logs (separate for security events)
    new DailyRotateFile({
      filename: `${config.logging.dir}/audit-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '90d', // Keep audit logs for 90 days
      format: json(),
    }),
  ],
});

// Create a child logger with correlation ID
export const createLogger = (correlationId?: string) => {
  return logger.child({ correlationId });
};

// Export audit logger for security events
export const auditLogger = logger.child({ type: 'audit' });

export default logger;
