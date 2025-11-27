import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
  const contextStr = context ? `[${context}]` : '';
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  const traceStr = trace ? `\n${trace}` : '';
  return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}${traceStr}`;
});

// Custom log format for files (JSON)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  json(),
);

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService?: ConfigService) {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');
    const logDir = process.env.LOG_DIR || './logs';

    // Daily rotate file transport for all logs
    const allLogsTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'alnet-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    });

    // Daily rotate file transport for errors only
    const errorLogsTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'alnet-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    });

    // Console transport
    const consoleTransport = new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat,
      ),
    });

    const transports: winston.transport[] = [consoleTransport];

    // Add file transports in production or if explicitly enabled
    if (isProduction || process.env.LOG_TO_FILE === 'true') {
      transports.push(allLogsTransport, errorLogsTransport);
    }

    this.logger = winston.createLogger({
      level: logLevel,
      defaultMeta: { service: 'alnet-backend' },
      transports,
      exceptionHandlers: [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'alnet-exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: fileFormat,
        }),
      ],
      rejectionHandlers: [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'alnet-rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: fileFormat,
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { 
      trace, 
      context: context || this.context 
    });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Extended methods for structured logging
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, { context: this.context, ...meta });
  }

  http(message: string, meta?: Record<string, any>): void {
    this.logger.http(message, { context: this.context, ...meta });
  }

  // Audit logging for security events
  audit(action: string, userId: string, details?: Record<string, any>): void {
    this.logger.info(`AUDIT: ${action}`, {
      context: 'AuditLog',
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  perf(operation: string, durationMs: number, meta?: Record<string, any>): void {
    this.logger.info(`PERF: ${operation} completed in ${durationMs}ms`, {
      context: 'Performance',
      operation,
      durationMs,
      ...meta,
    });
  }

  // API request logging
  request(method: string, url: string, statusCode: number, responseTime: number, userId?: string): void {
    this.logger.http(`${method} ${url} ${statusCode} ${responseTime}ms`, {
      context: 'HTTP',
      method,
      url,
      statusCode,
      responseTime,
      userId,
    });
  }
}

// Factory function for creating logger instances
export function createLogger(context?: string): LoggerService {
  const logger = new LoggerService();
  if (context) {
    logger.setContext(context);
  }
  return logger;
}
