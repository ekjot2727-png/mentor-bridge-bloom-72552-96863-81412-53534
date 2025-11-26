import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserProfile, Message, Connection, Event, Job, Analytics, Startup } from '@/database/entities';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'mentor_bridge_bloom'),
        entities: [User, UserProfile, Message, Connection, Event, Job, Analytics, Startup],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('DB_LOGGING') === 'true',
        dropSchema: false,
      }),
    }),
  ],
  exports: [ConfigModule, TypeOrmModule],
})
export class DatabaseModule {}
