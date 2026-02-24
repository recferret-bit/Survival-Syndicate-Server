import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { RedisService } from '@lib/shared/redis';

const KEY_PREFIX = 'currency-rate';

interface CachedRate {
  fromCurrency: string;
  toCurrency: string;
  date: string;
  rate: string;
}

@Injectable()
export class CurrencyRateCacheReader {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Get exchange rate from Redis cache (same key format as currency-rate service RatesCacheService).
   * Returns null if not in cache.
   */
  async getRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<BigNumber | null> {
    try {
      const dateStr = date.toISOString().slice(0, 10);
      const key = `${KEY_PREFIX}:${fromCurrency}:${toCurrency}:${dateStr}`;
      const cached = await this.redisService.get<CachedRate>(key);
      if (!cached?.rate) return null;
      return new BigNumber(cached.rate);
    } catch {
      return null;
    }
  }
}
