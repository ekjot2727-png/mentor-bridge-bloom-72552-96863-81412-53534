import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../constants';
import { EmailJobData } from '../queue.service';
import { LoggerService } from '../../services/logger.service';
import { EmailService } from '../../services/email.service';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  constructor(
    private logger: LoggerService,
    private emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    const { to, subject, template, context } = job.data;
    
    this.logger.log(`Processing email job ${job.id}: ${subject} to ${to}`);

    try {
      // Use the EmailService for sending templated emails
      const result = await this.emailService.send({
        to,
        subject,
        template,
        context,
      });
      
      this.logger.log(`Email sent successfully: ${job.id}`);
      return { success: result, sentAt: new Date() };
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed: ${error.message}`);
      throw error;
    }
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
