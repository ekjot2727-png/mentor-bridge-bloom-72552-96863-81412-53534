import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { User, UserRole, UserStatus, Analytics, Message, Connection, ConnectionStatus } from '@/database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Analytics) private analyticsRepository: Repository<Analytics>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Connection) private connectionRepository: Repository<Connection>,
  ) {}

  // User Statistics
  async getUserStatistics(startDate?: Date, endDate?: Date) {
    const where = {};
    if (startDate && endDate) {
      where['createdAt'] = Between(startDate, endDate);
    }

    const totalUsers = await this.userRepository.count();
    const studentCount = await this.userRepository.count({ where: { role: UserRole.STUDENT } });
    const alumniCount = await this.userRepository.count({ where: { role: UserRole.ALUMNI } });
    const adminCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const inactiveUsers = await this.userRepository.count({ where: { status: UserStatus.INACTIVE } });

    const newUsersInRange = await this.userRepository.count({ where });

    // User retention
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthUsers = await this.userRepository.count({
      where: { createdAt: MoreThan(lastMonthStart) },
    });

    return {
      totalUsers,
      byRole: {
        students: studentCount,
        alumni: alumniCount,
        admins: adminCount,
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
      newUsersInRange,
      lastMonthNewUsers: lastMonthUsers,
      retentionRate: ((activeUsers / totalUsers) * 100).toFixed(2),
    };
  }

  // Engagement Metrics
  async getEngagementMetrics(startDate?: Date, endDate?: Date) {
    const where = {};
    if (startDate && endDate) {
      where['createdAt'] = Between(startDate, endDate);
    }

    const totalMessages = await this.messageRepository.count({ where });
    const totalConnections = await this.connectionRepository.count({
      where: { ...where, status: ConnectionStatus.ACCEPTED },
    });
    const pendingConnections = await this.connectionRepository.count({
      where: { ...where, status: ConnectionStatus.PENDING },
    });

    // Messages by day
    const messagesByDay = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('DATE(analytics.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.eventType = :eventType', { eventType: 'message_sent' })
      .andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
      })
      .groupBy('DATE(analytics.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Login activity
    const uniqueLoginUsers = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .select('COUNT(DISTINCT analytics."userId")', 'count')
      .where('analytics.eventType = :eventType', { eventType: 'login' })
      .andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
      })
      .getRawOne();

    return {
      totalMessages,
      totalConnections,
      pendingConnections,
      messagesByDay,
      uniqueActiveUsers: parseInt(uniqueLoginUsers?.count || 0),
    };
  }

  // Platform Health
  async getPlatformHealth() {
    const now = new Date();
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);

    const recentErrors = await this.analyticsRepository.count({
      where: {
        eventType: 'error',
        createdAt: MoreThan(fiveMinsAgo),
      },
    });

    const uptime = 99.9; // Should be calculated from monitoring
    const avgResponseTime = 150; // Should be collected from requests

    return {
      uptime: `${uptime}%`,
      avgResponseTime: `${avgResponseTime}ms`,
      recentErrors,
      status: recentErrors === 0 ? 'healthy' : 'warning',
    };
  }

  // Profile Completeness
  async getProfileCompleteness() {
    const query = `
      SELECT 
        AVG(CASE 
          WHEN bio IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN "profilePhotoUrl" IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN skills IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN "currentCompany" IS NOT NULL THEN 1 ELSE 0 END +
          CASE WHEN location IS NOT NULL THEN 1 ELSE 0 END
        ) / 5.0 * 100 as "averageCompleteness"
      FROM user_profiles
    `;

    // This would need a raw query executor - simplified for example
    return {
      averageCompleteness: 65,
      byRole: {
        students: 45,
        alumni: 78,
      },
    };
  }

  // Connection Statistics
  async getConnectionStatistics() {
    const totalConnections = await this.connectionRepository.count({
      where: { status: ConnectionStatus.ACCEPTED },
    });
    const pendingRequests = await this.connectionRepository.count({
      where: { status: ConnectionStatus.PENDING },
    });
    const rejectedConnections = await this.connectionRepository.count({
      where: { status: ConnectionStatus.REJECTED },
    });

    return {
      totalConnections,
      pendingRequests,
      rejectedConnections,
      acceptanceRate: ((totalConnections / (totalConnections + rejectedConnections)) * 100).toFixed(2),
    };
  }

  // Advanced Filtering Support
  async getAnalyticsReport(filters: any) {
    const {
      startDate,
      endDate,
      eventType,
      userId,
      userRole,
      limit = 100,
      offset = 0,
    } = filters;

    const query = this.analyticsRepository.createQueryBuilder('analytics');

    if (startDate && endDate) {
      query.andWhere('analytics.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (eventType) {
      query.andWhere('analytics.eventType = :eventType', { eventType });
    }

    if (userId) {
      query.andWhere('analytics.userId = :userId', { userId });
    }

    const report = await query
      .orderBy('analytics.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data: report[0],
      total: report[1],
      page: Math.ceil(offset / limit) + 1,
      pageSize: limit,
    };
  }

  // Log analytics event
  async logEvent(
    eventType: string,
    userId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const event = this.analyticsRepository.create({
      eventType,
      userId,
      metadata,
      ipAddress,
      userAgent,
    });

    return this.analyticsRepository.save(event);
  }

  // Export data as CSV
  async exportAnalyticsData(filters: any): Promise<string> {
    const report = await this.getAnalyticsReport({ ...filters, limit: 10000 });

    let csv = 'ID,Event Type,User ID,Created At,Metadata\n';
    report.data.forEach(event => {
      const metadata = JSON.stringify(event.metadata || {}).replace(/"/g, '""');
      csv += `"${event.id}","${event.eventType}","${event.userId}","${event.createdAt}","${metadata}"\n`;
    });

    return csv;
  }

  // Dashboard summary
  async getDashboardSummary(startDate?: Date, endDate?: Date) {
    const users = await this.getUserStatistics(startDate, endDate);
    const engagement = await this.getEngagementMetrics(startDate, endDate);
    const platform = await this.getPlatformHealth();
    const connections = await this.getConnectionStatistics();
    const profiles = await this.getProfileCompleteness();

    return {
      users,
      engagement,
      platform,
      connections,
      profiles,
      timestamp: new Date(),
    };
  }
}
