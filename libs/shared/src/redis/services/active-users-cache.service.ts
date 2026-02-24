import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

const BEARER_TOKEN_HASH_TTL = 30 * 24 * 60 * 60; // 30 days in seconds (matching JWT expiration)

@Injectable()
export class BearerTokenHashCacheService {
  private readonly logger = new Logger(BearerTokenHashCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get the Redis key for a user's bearer token hash
   */
  private getKey(userId: string): string {
    return `bearer:hash:${userId}`;
  }

  /**
   * Store bearer token hash for a user in Redis
   * @param userId - User ID
   * @param hash - Hashed bearer token
   */
  async setBearerTokenHash(userId: string, hash: string): Promise<void> {
    try {
      await this.redisService.set(
        this.getKey(userId),
        hash,
        BEARER_TOKEN_HASH_TTL,
      );
    } catch (error) {
      this.logger.warn(
        `Error setting bearer token hash for user ${userId}: ${error.message}`,
        error.stack,
      );
      // Don't throw - fail gracefully if Redis is unavailable
    }
  }

  /**
   * Retrieve bearer token hash for a user from Redis
   * @param userId - User ID
   * @returns Bearer token hash or null if not found
   */
  async getBearerTokenHash(userId: string): Promise<string | null> {
    try {
      return await this.redisService.get<string>(this.getKey(userId));
    } catch (error) {
      this.logger.warn(
        `Error getting bearer token hash for user ${userId}: ${error.message}`,
        error.stack,
      );
      return null; // Fail-open: if Redis is unavailable, return null
    }
  }

  /**
   * Remove bearer token hash for a user from Redis
   * @param userId - User ID
   */
  async removeBearerTokenHash(userId: string): Promise<void> {
    try {
      await this.redisService.del(this.getKey(userId));
    } catch (error) {
      this.logger.warn(
        `Error removing bearer token hash for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
