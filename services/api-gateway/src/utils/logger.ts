import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, correlationId, ...metadata }) => {
  let msg = `${timestamp} [${level}]`;

  if (correlationId) {
    msg += ` [${correlationId}]`;
  }

  msg += `: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.env === 'development' ? customFormat : json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),

    // File transport for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: json(),
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: json(),
    }),
  ],
});

// Create a child logger with correlation ID
export const createLogger = (correlationId?: string) => {
  return logger.child({ correlationId });
};

export default logger;
