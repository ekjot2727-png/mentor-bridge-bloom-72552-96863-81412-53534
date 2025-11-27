import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { AuditLog, AuditAction, AuditCategory } from './entities/audit-log.entity';
import { LoggerService } from '../../common/services/logger.service';

export interface CreateAuditLogDto {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  category: AuditCategory;
  resource: string;
  resourceId?: string;
  description?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  isSensitive?: boolean;
}

export interface AuditQueryOptions {
  userId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private logger: LoggerService,
  ) {}

  /**
   * Create an audit log entry
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...dto,
        // Sanitize sensitive data before storing
        oldValue: dto.oldValue ? this.sanitizeSensitiveData(dto.oldValue) : null,
        newValue: dto.newValue ? this.sanitizeSensitiveData(dto.newValue) : null,
      });

      const saved = await this.auditLogRepository.save(auditLog);
      
      this.logger.log(`Audit log created: ${dto.action} on ${dto.resource}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      // Don't throw - audit logging should not break the main flow
      return null;
    }
  }

  /**
   * Query audit logs with filters
   */
  async query(options: AuditQueryOptions): Promise<{ data: AuditLog[]; total: number }> {
    const { userId, action, category, resource, startDate, endDate, page = 1, limit = 50 } = options;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (category) {
      queryBuilder.andWhere('audit.category = :category', { category });
    }

    if (resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource });
    }

    if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, days: number = 30): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditLogRepository.find({
      where: {
        userId,
        createdAt: MoreThan(startDate),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  /**
   * Get security events (failed logins, permission changes, etc.)
   */
  async getSecurityEvents(hours: number = 24): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.auditLogRepository.find({
      where: {
        category: AuditCategory.SECURITY,
        createdAt: MoreThan(startDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(hours: number = 1): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    return this.auditLogRepository.find({
      where: {
        action: AuditAction.FAILED_LOGIN,
        createdAt: MoreThan(startDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanup(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository.delete({
      createdAt: LessThan(cutoffDate),
      isSensitive: false, // Keep sensitive logs longer
    });

    this.logger.log(`Audit log cleanup: removed ${result.affected} old entries`);
    return result.affected || 0;
  }

  /**
   * Sanitize sensitive data before storing
   */
  private sanitizeSensitiveData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'creditCard',
      'ssn',
      'cvv',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Convenience methods for common audit events

  async logLogin(userId: string, userEmail: string, ipAddress: string, userAgent: string) {
    return this.log({
      userId,
      userEmail,
      action: AuditAction.LOGIN,
      category: AuditCategory.AUTHENTICATION,
      resource: 'User',
      resourceId: userId,
      description: 'User logged in',
      ipAddress,
      userAgent,
    });
  }

  async logLogout(userId: string, userEmail: string) {
    return this.log({
      userId,
      userEmail,
      action: AuditAction.LOGOUT,
      category: AuditCategory.AUTHENTICATION,
      resource: 'User',
      resourceId: userId,
      description: 'User logged out',
    });
  }

  async logFailedLogin(email: string, ipAddress: string, userAgent: string, reason: string) {
    return this.log({
      userEmail: email,
      action: AuditAction.FAILED_LOGIN,
      category: AuditCategory.SECURITY,
      resource: 'User',
      description: `Failed login attempt: ${reason}`,
      ipAddress,
      userAgent,
      isSensitive: true,
    });
  }

  async logPasswordChange(userId: string, userEmail: string) {
    return this.log({
      userId,
      userEmail,
      action: AuditAction.PASSWORD_CHANGE,
      category: AuditCategory.SECURITY,
      resource: 'User',
      resourceId: userId,
      description: 'User changed password',
      isSensitive: true,
    });
  }

  async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
  ) {
    return this.log({
      userId,
      action: AuditAction.DATA_ACCESS,
      category: AuditCategory.DATA,
      resource,
      resourceId,
      description: `Accessed ${resource} data`,
      metadata,
    });
  }

  async logPayment(
    userId: string,
    amount: number,
    currency: string,
    paymentId: string,
    metadata?: Record<string, any>,
  ) {
    return this.log({
      userId,
      action: AuditAction.PAYMENT,
      category: AuditCategory.PAYMENT,
      resource: 'Payment',
      resourceId: paymentId,
      description: `Payment of ${amount} ${currency}`,
      metadata: { ...metadata, amount, currency },
      isSensitive: true,
    });
  }
}
