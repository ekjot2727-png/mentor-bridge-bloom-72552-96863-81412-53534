import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CacheService } from '../../services/cache.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.cacheService.getRedisClient();
      
      if (!client || !this.cacheService.isAvailable()) {
        throw new Error('Redis client not connected');
      }

      // Ping Redis to check connection
      const pingResult = await client.ping();
      
      if (pingResult === 'PONG') {
        return this.getStatus(key, true, {
          status: 'connected',
          responseTime: 'healthy',
        });
      }

      throw new Error('Redis ping failed');
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'disconnected',
        error: error.message,
      });
      throw new HealthCheckError('Redis health check failed', result);
    }
  }
}
