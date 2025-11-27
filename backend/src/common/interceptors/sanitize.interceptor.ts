import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Sanitizes input data to prevent XSS and injection attacks
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.body) {
      request.body = this.sanitize(request.body);
    }
    
    if (request.query) {
      request.query = this.sanitize(request.query);
    }
    
    if (request.params) {
      request.params = this.sanitize(request.params);
    }

    return next.handle();
  }

  private sanitize(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }
    
    if (data !== null && typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value);
      }
      return sanitized;
    }
    
    return data;
  }

  private sanitizeString(str: string): string {
    // Remove potential XSS vectors
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#x60;')
      .trim();
  }
}
