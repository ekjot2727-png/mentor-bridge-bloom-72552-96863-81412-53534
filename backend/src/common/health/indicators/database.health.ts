import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('Database connection not initialized');
      }

      // Execute a simple query to verify connection
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        database: this.dataSource.options.database,
      });
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'disconnected',
        error: error.message,
      });
      throw new HealthCheckError('Database health check failed', result);
    }
  }
}
