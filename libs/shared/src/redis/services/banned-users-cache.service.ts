import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

const BANNED_USERS_CACHE_KEY = 'banned:users';

@Injectable()
export class BannedUsersCacheService {
  private readonly logger = new Logger(BannedUsersCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check if a user is banned
   */
  async isBanned(userId: string): Promise<boolean> {
    try {
      return await this.redisService.sismember(BANNED_USERS_CACHE_KEY, userId);
    } catch (error) {
      this.logger.warn(
        `Error checking if user is banned: ${error.message}`,
        error.stack,
      );
      return false; // Fail-open: if Redis is unavailable, assume not banned
    }
  }

  /**
   * Update entire cache with list of banned user IDs
   */
  async updateCache(userIds: string[]): Promise<void> {
    try {
      // Clear existing cache
      await this.redisService.sremAll(BANNED_USERS_CACHE_KEY);
      this.logger.log('Cleared existing banned users cache');

      // Populate cache with banned user IDs
      if (userIds.length > 0) {
        await this.redisService.sadd(BANNED_USERS_CACHE_KEY, ...userIds);
        this.logger.log(
          `Populated cache with ${userIds.length} banned user IDs`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating banned users cache: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Add a single user to banned set
   */
  async add(userId: string): Promise<void> {
    try {
      await this.redisService.sadd(BANNED_USERS_CACHE_KEY, userId);
    } catch (error) {
      this.logger.warn(
        `Error adding user to banned cache: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Remove a user from banned set
   */
  async remove(userId: string): Promise<void> {
    try {
      await this.redisService.srem(BANNED_USERS_CACHE_KEY, userId);
    } catch (error) {
      this.logger.warn(
        `Error removing user from banned cache: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Clear entire banned users cache
   */
  async clear(): Promise<void> {
    try {
      await this.redisService.sremAll(BANNED_USERS_CACHE_KEY);
    } catch (error) {
      this.logger.warn(
        `Error clearing banned users cache: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Get count of banned users in cache
   */
  async getCount(): Promise<number> {
    try {
      return await this.redisService.scard(BANNED_USERS_CACHE_KEY);
    } catch (error) {
      this.logger.warn(
        `Error getting banned users count: ${error.message}`,
        error.stack,
      );
      return 0;
    }
  }
}
