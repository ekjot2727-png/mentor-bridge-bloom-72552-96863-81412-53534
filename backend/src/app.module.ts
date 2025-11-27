import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AiModule } from './modules/ai/ai.module';
import { StartupsModule } from './modules/startups/startups.module';
import { CommonModule } from './common/common.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthModule } from './common/health/health.module';
import { QueueModule } from './common/queues/queue.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { AuditModule } from './modules/audit/audit.module';
import { DonationsModule } from './modules/donations/donations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommonModule,
    DatabaseModule,
    HealthModule,
    QueueModule,
    RateLimitModule,
    AuthModule,
    ProfilesModule,
    MessagesModule,
    ConnectionsModule,
    AnalyticsModule,
    JobsModule,
    AiModule,
    StartupsModule,
    AuditModule,
    DonationsModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
