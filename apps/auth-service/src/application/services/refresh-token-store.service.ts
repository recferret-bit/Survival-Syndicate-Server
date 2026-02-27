import { Injectable } from '@nestjs/common';
import { RedisService } from '@lib/shared/redis';

@Injectable()
export class RefreshTokenStoreService {
  private static readonly REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `auth:refresh-token-hash:${userId}`;
  }

  async set(userId: string, refreshTokenHash: string): Promise<void> {
    await this.redisService.set(
      this.getKey(userId),
      refreshTokenHash,
      RefreshTokenStoreService.REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  async get(userId: string): Promise<string | null> {
    return this.redisService.get<string>(this.getKey(userId));
  }

  async remove(userId: string): Promise<void> {
    await this.redisService.del(this.getKey(userId));
  }
}
