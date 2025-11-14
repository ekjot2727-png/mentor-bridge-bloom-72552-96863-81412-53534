import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getUserStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getUserStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('engagement')
  @UseGuards(JwtAuthGuard)
  getEngagementMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getEngagementMetrics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('platform-health')
  @UseGuards(JwtAuthGuard)
  getPlatformHealth() {
    return this.analyticsService.getPlatformHealth();
  }

  @Get('dashboard-summary')
  @UseGuards(JwtAuthGuard)
  getDashboardSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getDashboardSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('export')
  @UseGuards(JwtAuthGuard)
  async exportAnalytics(
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const data = await this.analyticsService.exportAnalyticsData(
      format,
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics.json"');
    }

    return res.send(data);
  }

  @Post('log-event')
  @UseGuards(JwtAuthGuard)
  logEvent(
    @Request() req,
    @Query('eventType') eventType: string,
    @Query('metadata') metadata?: string,
  ) {
    return this.analyticsService.logEvent(
      req.user.id,
      eventType,
      metadata ? JSON.parse(metadata) : {},
    );
  }
}
