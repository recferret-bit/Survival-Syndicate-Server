import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import BigNumber from 'bignumber.js';
import { REDIS_CLIENT } from '@lib/shared/redis';

@Injectable()
export class BalanceLockService {
  private readonly logger = new Logger(BalanceLockService.name);
  private readonly LOCK_TTL = 30; // seconds
  private readonly LOCK_PREFIX = 'balance:lock';

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  /**
   * Acquire a distributed lock for a user operation
   * Uses SETNX pattern: SET key value NX EX ttl
   * @param userId - User ID
   * @param operationId - Operation ID (for idempotency)
   * @param ttl - Lock TTL in seconds (default: 30)
   * @returns true if lock acquired, false if already locked
   */
  async acquireLock(
    userId: BigNumber,
    operationId: string,
    ttl: number = this.LOCK_TTL,
  ): Promise<boolean> {
    const lockKey = this.getLockKey(userId, operationId);
    const lockValue = `${Date.now()}`;

    try {
      // SET key value NX EX ttl - set if not exists with expiration
      const result = await this.redisClient.set(
        lockKey,
        lockValue,
        'EX',
        ttl,
        'NX',
      );

      if (result === 'OK') {
        this.logger.debug(`Lock acquired: ${lockKey} (TTL: ${ttl}s)`);
        return true;
      }

      this.logger.debug(`Lock already exists: ${lockKey}`);
      return false;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to acquire lock ${lockKey}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Release a distributed lock
   * @param userId - User ID
   * @param operationId - Operation ID
   * @returns true if lock released, false if lock didn't exist
   */
  async releaseLock(userId: BigNumber, operationId: string): Promise<boolean> {
    const lockKey = this.getLockKey(userId, operationId);

    try {
      const result = await this.redisClient.del(lockKey);

      if (result === 1) {
        this.logger.debug(`Lock released: ${lockKey}`);
        return true;
      }

      this.logger.debug(`Lock not found: ${lockKey}`);
      return false;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to release lock ${lockKey}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check if a lock exists
   * @param userId - User ID
   * @param operationId - Operation ID
   * @returns true if lock exists, false otherwise
   */
  async isLocked(userId: BigNumber, operationId: string): Promise<boolean> {
    const lockKey = this.getLockKey(userId, operationId);

    try {
      const exists = await this.redisClient.exists(lockKey);
      return exists === 1;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to check lock ${lockKey}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Get lock key for Redis
   */
  private getLockKey(userId: BigNumber, operationId: string): string {
    return `${this.LOCK_PREFIX}:${userId.toString()}:${operationId}`;
  }
}
