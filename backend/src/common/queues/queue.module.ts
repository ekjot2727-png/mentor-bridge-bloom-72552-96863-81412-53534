import { Module, DynamicModule, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { QueueService } from './queue.service';
import { QUEUE_NAMES } from './constants';

const logger = new Logger('QueueModule');

@Module({})
export class QueueModule {
  static register(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED !== 'false';
    
    if (!redisEnabled) {
      logger.warn('Redis is disabled. Queue features will not be available.');
      return {
        module: QueueModule,
        providers: [QueueService],
        exports: [QueueService],
      };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            connection: {
              host: configService.get<string>('REDIS_HOST', 'localhost'),
              port: configService.get<number>('REDIS_PORT', 6379),
              password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
              maxRetriesPerRequest: 3,
              retryStrategy: (times: number) => {
                if (times > 3) {
                  logger.warn('Redis connection failed after 3 retries. Queues disabled.');
                  return null; // Stop retrying
                }
                return Math.min(times * 1000, 3000);
              },
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              removeOnComplete: {
                age: 24 * 3600,
                count: 1000,
              },
              removeOnFail: {
                age: 7 * 24 * 3600,
              },
            },
          }),
        }),
        BullModule.registerQueue(
          { name: QUEUE_NAMES.EMAIL },
          { name: QUEUE_NAMES.NOTIFICATION },
          { name: QUEUE_NAMES.ANALYTICS },
        ),
      ],
      providers: [QueueService, EmailProcessor, NotificationProcessor],
      exports: [QueueService, BullModule],
    };
  }
}
