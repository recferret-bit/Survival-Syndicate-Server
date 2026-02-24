import { Module, Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { RedisService } from './services/redis.service';
import { REDIS_CLIENT } from './const';
import { BannedUsersCacheService } from './services/banned-users-cache.service';
import { BearerTokenHashCacheService } from './services/active-users-cache.service';
import * as process from 'process';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('RedisClient');
        const retryTimeout = Number(process.env.REDIS_RETRY_TIMEOUT) || 5_000;

        const options: RedisOptions = {
          connectTimeout:
            Number(process.env.REDIS_CONNECTION_TIMEOUT) || 10_000,
          retryStrategy: (times: number) => {
            if (times > 10) {
              logger.error('Redis connection failed after 10 retries');
              return null; // Stop retrying after 10 attempts
            }
            return Math.min(times * 1_000, retryTimeout);
          },
          reconnectOnError: (err) => {
            const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
            return targetErrors.some((e) => err.message.includes(e));
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true,
          lazyConnect: false,
          keepAlive: 30000, // Keep connection alive
          family: 4, // Force IPv4
        };

        const client = new Redis(
          process.env.REDIS_URL || 'redis://localhost:6379',
          options,
        );

        // Handle connection errors to prevent unhandled error events
        client.on('error', (err) => {
          logger.error(`Redis connection error: ${err.message}`);
        });

        client.on('connect', () => {
          logger.log('Redis connected');
        });

        client.on('ready', () => {
          logger.log('Redis ready');
        });

        client.on('reconnecting', () => {
          logger.warn('Redis reconnecting...');
        });

        client.on('close', () => {
          logger.warn('Redis connection closed');
        });

        return client;
      },
    },
    RedisService,
    BannedUsersCacheService,
    BearerTokenHashCacheService,
  ],
  exports: [
    RedisService,
    REDIS_CLIENT,
    BannedUsersCacheService,
    BearerTokenHashCacheService,
  ],
})
export class RedisModule {}
