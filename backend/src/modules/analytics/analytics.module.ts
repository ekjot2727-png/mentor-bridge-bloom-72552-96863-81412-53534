import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Analytics } from '../../database/entities/analytics.entity';
import { User } from '../../database/entities/user.entity';
import { Message } from '../../database/entities/message.entity';
import { Connection } from '../../database/entities/connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, User, Message, Connection])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
