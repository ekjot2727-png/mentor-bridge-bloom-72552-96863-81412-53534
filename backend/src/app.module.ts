import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AiModule } from './modules/ai/ai.module';
import { StartupsModule } from './modules/startups/startups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ProfilesModule,
    MessagesModule,
    ConnectionsModule,
    AnalyticsModule,
    JobsModule,
    AiModule,
    StartupsModule,
  ],
})
export class AppModule {}
