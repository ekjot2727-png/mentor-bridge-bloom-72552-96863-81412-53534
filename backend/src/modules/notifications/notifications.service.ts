import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { QueueService } from '../../common/queues/queue.service';
import { LoggerService } from '../../common/services/logger.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  senderId?: string;
  expiresAt?: Date;
}

export interface BulkNotificationDto {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private queueService: QueueService,
    private logger: LoggerService,
  ) {}

  /**
   * Create and send a notification
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    // Check user preferences
    const preferences = await this.getOrCreatePreferences(dto.userId);
    
    // Check if user has this notification type enabled
    if (preferences.typePreferences[dto.type] === false) {
      this.logger.log(`User ${dto.userId} has disabled ${dto.type} notifications`);
      return null;
    }

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      this.logger.log(`Notification for ${dto.userId} delayed due to quiet hours`);
      // Could queue for later, for now just skip
    }

    // Create notification
    const notification = this.notificationRepository.create({
      ...dto,
      channel: dto.channel || NotificationChannel.IN_APP,
      priority: dto.priority || NotificationPriority.NORMAL,
    });

    const saved = await this.notificationRepository.save(notification);

    // Queue additional channel notifications
    await this.processChannelNotifications(saved, preferences);

    this.logger.log(`Notification created: ${saved.id} for user ${dto.userId}`);
    return saved;
  }

  /**
   * Send bulk notifications
   */
  async createBulk(dto: BulkNotificationDto): Promise<number> {
    const notifications = dto.userIds.map((userId) =>
      this.notificationRepository.create({
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        channel: dto.channel || NotificationChannel.IN_APP,
        priority: dto.priority || NotificationPriority.NORMAL,
        actionUrl: dto.actionUrl,
        metadata: dto.metadata,
      }),
    );

    const saved = await this.notificationRepository.save(notifications);
    this.logger.log(`Created ${saved.length} bulk notifications`);
    return saved.length;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    return {
      data: notifications,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      unreadCount: await this.getUnreadCount(userId),
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return null;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.affected || 0;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
    return (result.affected || 0) > 0;
  }

  /**
   * Delete old read notifications
   */
  async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.notificationRepository.delete({
      isRead: true,
      createdAt: LessThan(cutoffDate),
    });

    this.logger.log(`Cleaned up ${result.affected} old notifications`);
    return result.affected || 0;
  }

  /**
   * Get or create user preferences
   */
  async getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        typePreferences: this.getDefaultTypePreferences(),
      });
      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const preferences = await this.getOrCreatePreferences(userId);
    Object.assign(preferences, updates);
    return this.preferenceRepository.save(preferences);
  }

  /**
   * Register push token
   */
  async registerPushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<void> {
    const preferences = await this.getOrCreatePreferences(userId);
    preferences.pushToken = token;
    preferences.pushPlatform = platform;
    await this.preferenceRepository.save(preferences);
  }

  // Convenience methods for common notification types

  async notifyConnectionRequest(toUserId: string, fromUserId: string, fromUserName: string) {
    return this.create({
      userId: toUserId,
      type: NotificationType.CONNECTION_REQUEST,
      title: 'New Connection Request',
      message: `${fromUserName} wants to connect with you`,
      senderId: fromUserId,
      actionUrl: `/connections/pending`,
      actionLabel: 'View Request',
      priority: NotificationPriority.NORMAL,
    });
  }

  async notifyConnectionAccepted(toUserId: string, fromUserId: string, fromUserName: string) {
    return this.create({
      userId: toUserId,
      type: NotificationType.CONNECTION_ACCEPTED,
      title: 'Connection Accepted',
      message: `${fromUserName} accepted your connection request`,
      senderId: fromUserId,
      actionUrl: `/profile/${fromUserId}`,
      actionLabel: 'View Profile',
    });
  }

  async notifyNewMessage(toUserId: string, fromUserId: string, fromUserName: string) {
    return this.create({
      userId: toUserId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New Message',
      message: `You have a new message from ${fromUserName}`,
      senderId: fromUserId,
      actionUrl: `/messages/${fromUserId}`,
      actionLabel: 'Reply',
      priority: NotificationPriority.HIGH,
    });
  }

  async notifyNewJobPosting(userIds: string[], jobTitle: string, jobId: string) {
    return this.createBulk({
      userIds,
      type: NotificationType.NEW_JOB_POSTING,
      title: 'New Job Opportunity',
      message: `A new job has been posted: ${jobTitle}`,
      actionUrl: `/jobs/${jobId}`,
      priority: NotificationPriority.NORMAL,
    });
  }

  async notifyEventReminder(userId: string, eventTitle: string, eventId: string, startTime: Date) {
    return this.create({
      userId,
      type: NotificationType.EVENT_REMINDER,
      title: 'Event Reminder',
      message: `Reminder: "${eventTitle}" starts at ${startTime.toLocaleString()}`,
      relatedEntityId: eventId,
      relatedEntityType: 'Event',
      actionUrl: `/events/${eventId}`,
      actionLabel: 'View Event',
      priority: NotificationPriority.HIGH,
    });
  }

  async notifySystemAnnouncement(userIds: string[], title: string, message: string) {
    return this.createBulk({
      userIds,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title,
      message,
      priority: NotificationPriority.HIGH,
    });
  }

  // Private helper methods

  private async processChannelNotifications(
    notification: Notification,
    preferences: NotificationPreference,
  ): Promise<void> {
    // Send email if enabled
    if (preferences.emailEnabled && notification.priority !== NotificationPriority.LOW) {
      try {
        await this.queueService.sendNotification({
          userId: notification.userId,
          type: 'email',
          title: notification.title,
          message: notification.message,
          data: {
            notificationId: notification.id,
            actionUrl: notification.actionUrl,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to queue email notification: ${error.message}`);
      }
    }

    // Send push if enabled and token exists
    if (preferences.pushEnabled && preferences.pushToken) {
      try {
        await this.queueService.sendNotification({
          userId: notification.userId,
          type: 'push',
          title: notification.title,
          message: notification.message,
          data: {
            notificationId: notification.id,
            actionUrl: notification.actionUrl,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to queue push notification: ${error.message}`);
      }
    }
  }

  private isInQuietHours(preferences: NotificationPreference): boolean {
    if (!preferences.quietHoursEnabled) return false;
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Simple time comparison (doesn't handle overnight quiet hours perfectly)
    return currentTime >= preferences.quietHoursStart || currentTime <= preferences.quietHoursEnd;
  }

  private getDefaultTypePreferences(): Record<NotificationType, boolean> {
    return Object.values(NotificationType).reduce(
      (acc, type) => ({ ...acc, [type]: true }),
      {} as Record<NotificationType, boolean>,
    );
  }
}
