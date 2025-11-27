import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants';
import { NotificationJobData } from '../queue.service';
import { LoggerService } from '../../services/logger.service';

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  constructor(private logger: LoggerService) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    const { userId, type, title, message, data } = job.data;
    
    this.logger.log(`Processing notification job ${job.id}: ${type} for user ${userId}`);

    try {
      switch (type) {
        case 'push':
          await this.sendPushNotification(userId, title, message, data);
          break;
        case 'in-app':
          await this.sendInAppNotification(userId, title, message, data);
          break;
        case 'email':
          // Delegate to email queue for better handling
          this.logger.log(`Email notification delegated for user ${userId}`);
          break;
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }
      
      this.logger.log(`Notification sent successfully: ${job.id}`);
      return { success: true, sentAt: new Date() };
    } catch (error) {
      this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<void> {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.logger.log(`[PUSH] User: ${userId}, Title: ${title}, Message: ${message}`);
  }

  private async sendInAppNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<void> {
    // TODO: Save to database and emit via WebSocket
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.logger.log(`[IN-APP] User: ${userId}, Title: ${title}, Message: ${message}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<NotificationJobData>) {
    this.logger.log(`Notification job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NotificationJobData>, error: Error) {
    this.logger.error(`Notification job ${job.id} failed: ${error.message}`, error.stack);
  }
}
