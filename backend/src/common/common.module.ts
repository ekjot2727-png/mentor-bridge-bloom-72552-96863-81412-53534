import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { CacheService } from './services/cache.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  providers: [LoggerService, CacheService, EmailService],
  exports: [LoggerService, CacheService, EmailService],
})
export class CommonModule {}
