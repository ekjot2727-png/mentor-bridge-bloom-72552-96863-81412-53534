import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.socket.remoteAddress;

    const now = Date.now();
    const requestId = this.generateRequestId();

    // Log incoming request
    this.logger.info(`Incoming Request: ${method} ${url}`, {
      requestId,
      method,
      url,
      userAgent,
      ip,
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.request(method, url, response.statusCode, responseTime);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Request Failed: ${method} ${url} - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'apiKey'];
    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
