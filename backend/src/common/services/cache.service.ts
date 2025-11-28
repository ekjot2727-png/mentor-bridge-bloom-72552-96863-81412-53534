import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggerService } from './logger.service';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis | null = null;
  private isConnected: boolean = false;
  private redisEnabled: boolean = false;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  async onModuleInit() {
    // Check if Redis is enabled via environment variable
    this.redisEnabled = this.configService.get<string>('REDIS_ENABLED', 'true') !== 'false';
    
    if (!this.redisEnabled) {
      this.logger.log('Redis disabled via REDIS_ENABLED=false, caching disabled');
      return;
    }

    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD', '');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
      db: redisDb,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis connection failed, running without cache');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    this.redisClient.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    });

    this.redisClient.on('error', (error) => {
      this.isConnected = false;
      this.logger.warn(`Redis error: ${error.message}`);
    });

    this.redisClient.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    this.redisClient.on('end', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection ended, caching disabled');
    });

    try {
      await this.redisClient.connect();
    } catch (error) {
      this.logger.warn(`Failed to connect to Redis: ${error.message}. Caching disabled.`);
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isConnected;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      this.logger.error(`Cache deletePattern error for pattern ${pattern}: ${error.message}`);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      return (await this.redisClient.exists(key)) === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async incr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;
    try {
      return this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Cache incr error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async decr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;
    try {
      return this.redisClient.decr(key);
    } catch (error) {
      this.logger.error(`Cache decr error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get or set pattern - returns cached value or executes factory function
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Set expiration on an existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Cache expire error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.redisClient.flushdb();
      return true;
    } catch (error) {
      this.logger.error(`Cache flush error: ${error.message}`);
      return false;
    }
  }

  /**
   * Hash operations
   */
  async hset(key: string, field: string, value: any): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.redisClient.hset(key, field, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Cache hset error for key ${key}: ${error.message}`);
      return false;
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const value = await this.redisClient.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache hget error for key ${key}: ${error.message}`);
      return null;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.redisClient.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      this.logger.error(`Cache hgetall error for key ${key}: ${error.message}`);
      return null;
    }
  }

  getRedisClient(): Redis {
    return this.redisClient;
  }
}
