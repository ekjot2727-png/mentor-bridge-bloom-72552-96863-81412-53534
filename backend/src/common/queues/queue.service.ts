import { Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from './constants';
import { LoggerService } from '../services/logger.service';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface NotificationJobData {
  userId: string;
  type: 'push' | 'in-app' | 'email';
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface AnalyticsJobData {
  event: string;
  userId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class QueueService {
  private readonly isEnabled: boolean;

  constructor(
    @Optional() @InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Queue,
    @Optional() @InjectQueue(QUEUE_NAMES.NOTIFICATION) private notificationQueue: Queue,
    @Optional() @InjectQueue(QUEUE_NAMES.ANALYTICS) private analyticsQueue: Queue,
    private logger: LoggerService,
  ) {
    this.isEnabled = !!emailQueue && !!notificationQueue && !!analyticsQueue;
    if (!this.isEnabled) {
      this.logger.warn('Queue service is running without Redis. Jobs will be logged only.');
    }
  }

  /**
   * Add email to the queue
   */
  async sendEmail(data: EmailJobData, options?: { delay?: number; priority?: number }) {
    if (!this.isEnabled) {
      this.logger.log(`[QUEUE DISABLED] Would send email: ${data.subject} to ${data.to}`);
      return null;
    }

    try {
      const job = await this.emailQueue.add('send-email', data, {
        delay: options?.delay,
        priority: options?.priority,
      });
      this.logger.log(`Email job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add email job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add notification to the queue
   */
  async sendNotification(data: NotificationJobData, options?: { delay?: number }) {
    if (!this.isEnabled) {
      this.logger.log(`[QUEUE DISABLED] Would send notification: ${data.title} to user ${data.userId}`);
      return null;
    }

    try {
      const job = await this.notificationQueue.add('send-notification', data, {
        delay: options?.delay,
      });
      this.logger.log(`Notification job added to queue: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add notification job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add analytics event to the queue
   */
  async trackAnalytics(data: AnalyticsJobData) {
    if (!this.isEnabled) {
      this.logger.log(`[QUEUE DISABLED] Would track analytics: ${data.event}`);
      return null;
    }

    try {
      const job = await this.analyticsQueue.add('track-event', data);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add analytics job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk email sending
   */
  async sendBulkEmails(emails: EmailJobData[]) {
    if (!this.isEnabled) {
      this.logger.log(`[QUEUE DISABLED] Would send ${emails.length} bulk emails`);
      return [];
    }

    const jobs = emails.map((email) => ({
      name: 'send-email',
      data: email,
    }));
    
    try {
      const result = await this.emailQueue.addBulk(jobs);
      this.logger.log(`${result.length} email jobs added to queue`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to add bulk email jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk notifications
   */
  async sendBulkNotifications(notifications: NotificationJobData[]) {
    if (!this.isEnabled) {
      this.logger.log(`[QUEUE DISABLED] Would send ${notifications.length} bulk notifications`);
      return [];
    }

    const jobs = notifications.map((notification) => ({
      name: 'send-notification',
      data: notification,
    }));
    
    try {
      const result = await this.notificationQueue.addBulk(jobs);
      this.logger.log(`${result.length} notification jobs added to queue`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to add bulk notification jobs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Schedule an email for later
   */
  async scheduleEmail(data: EmailJobData, sendAt: Date) {
    const delay = sendAt.getTime() - Date.now();
    if (delay < 0) {
      throw new Error('Scheduled time must be in the future');
    }
    return this.sendEmail(data, { delay });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    if (!this.isEnabled) {
      return { email: {}, notification: {}, analytics: {}, enabled: false };
    }

    const [emailCounts, notificationCounts, analyticsCounts] = await Promise.all([
      this.emailQueue.getJobCounts(),
      this.notificationQueue.getJobCounts(),
      this.analyticsQueue.getJobCounts(),
    ]);

    return {
      email: emailCounts,
      notification: notificationCounts,
      analytics: analyticsCounts,
      enabled: true,
    };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: keyof typeof QUEUE_NAMES) {
    if (!this.isEnabled) {
      this.logger.warn('[QUEUE DISABLED] Cannot pause queue');
      return;
    }
    const queue = this.getQueue(queueName);
    await queue.pause();
    this.logger.log(`Queue ${queueName} paused`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: keyof typeof QUEUE_NAMES) {
    if (!this.isEnabled) {
      this.logger.warn('[QUEUE DISABLED] Cannot resume queue');
      return;
    }
    const queue = this.getQueue(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  private getQueue(queueName: keyof typeof QUEUE_NAMES): Queue {
    switch (queueName) {
      case 'EMAIL':
        return this.emailQueue;
      case 'NOTIFICATION':
        return this.notificationQueue;
      case 'ANALYTICS':
        return this.analyticsQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}
