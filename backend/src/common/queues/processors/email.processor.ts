import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants';
import { EmailJobData } from '../queue.service';
import { LoggerService } from '../../services/logger.service';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  constructor(private logger: LoggerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    const { to, subject, template, context } = job.data;
    
    this.logger.log(`Processing email job ${job.id}: ${subject} to ${to}`);

    try {
      // TODO: Integrate with actual email service (SendGrid, Nodemailer, etc.)
      // For now, simulate email sending
      await this.simulateEmailSend(to, subject, template, context);
      
      this.logger.log(`Email sent successfully: ${job.id}`);
      return { success: true, sentAt: new Date() };
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  private async simulateEmailSend(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // Log the email details (in production, this would send the actual email)
    this.logger.log(`[EMAIL] To: ${to}, Subject: ${subject}, Template: ${template}`);
    
    // In production, replace with:
    // await this.emailService.send({ to, subject, template, context });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailJobData>) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailJobData>, error: Error) {
    this.logger.error(`Email job ${job.id} failed: ${error.message}`, error.stack);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<EmailJobData>, progress: number | object) {
    this.logger.log(`Email job ${job.id} progress: ${JSON.stringify(progress)}`);
  }
}
