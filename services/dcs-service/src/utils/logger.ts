import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (config.env !== 'test') {
  // General application logs
  transports.push(
    new DailyRotateFile({
      filename: `${config.logging.dir}/${config.serviceName}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      format: logFormat,
    })
  );

  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: `${config.logging.dir}/${config.serviceName}-error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      level: 'error',
      format: logFormat,
    })
  );

  // Check-in transaction logs
  if (config.logging.checkInTransactions) {
    transports.push(
      new DailyRotateFile({
        filename: `${config.logging.dir}/check-in-transactions-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: config.logging.maxSize,
        maxFiles: config.logging.maxFiles,
        format: logFormat,
      })
    );
  }

  // Baggage operation logs
  if (config.logging.baggageOperations) {
    transports.push(
      new DailyRotateFile({
        filename: `${config.logging.dir}/baggage-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: config.logging.maxSize,
        maxFiles: config.logging.maxFiles,
        format: logFormat,
      })
    );
  }

  // APIS submission logs
  if (config.logging.apisSubmissions) {
    transports.push(
      new DailyRotateFile({
        filename: `${config.logging.dir}/apis-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: config.logging.maxSize,
        maxFiles: config.logging.maxFiles,
        format: logFormat,
      })
    );
  }
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create child loggers for specific operations
export const checkInLogger = logger.child({ service: 'check-in' });
export const baggageLogger = logger.child({ service: 'baggage' });
export const apisLogger = logger.child({ service: 'apis' });
export const auditLogger = logger.child({ service: 'audit' });
