import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import {
  User,
  UserProfile,
  Message,
  Connection,
  Event,
  Job,
  Analytics,
} from '../database/entities';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mentor_bridge_bloom',
  entities: [User, UserProfile, Message, Connection, Event, Job, Analytics],
  migrations: [path.join(__dirname, '../database/migrations/**/*.ts')],
  migrationsTableName: 'migrations',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.DB_LOGGING === 'true',
  dropSchema: false,
});
