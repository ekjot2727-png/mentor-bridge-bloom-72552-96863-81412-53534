import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditService, AuditQueryOptions } from './audit.service';
import { AuditAction, AuditCategory } from './entities/audit-log.entity';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  @ApiQuery({ name: 'category', required: false, enum: AuditCategory })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async queryLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('category') category?: AuditCategory,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const options: AuditQueryOptions = {
      userId,
      action,
      category,
      resource,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    };

    return this.auditService.query(options);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUserActivity(
    @Query('userId') userId: string,
    @Query('days') days?: number,
  ) {
    return this.auditService.getUserActivity(userId, days || 30);
  }

  @Get('security')
  @ApiOperation({ summary: 'Get security events' })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getSecurityEvents(@Query('hours') hours?: number) {
    return this.auditService.getSecurityEvents(hours || 24);
  }

  @Get('failed-logins')
  @ApiOperation({ summary: 'Get failed login attempts' })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getFailedLogins(@Query('hours') hours?: number) {
    return this.auditService.getFailedLogins(hours || 1);
  }
}
