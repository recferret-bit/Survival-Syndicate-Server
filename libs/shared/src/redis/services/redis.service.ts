import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../const';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const storedValue = JSON.stringify({ value });
    if (ttl) {
      await this.redisClient.set(key, storedValue, 'EX', ttl);
    } else {
      await this.redisClient.set(key, storedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const storedValue = await this.redisClient.get(key);
    if (storedValue === null) {
      return null;
    }
    const parsedValue = JSON.parse(storedValue) as { value: T };

    return parsedValue.value;
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch {
      return false;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.srem(key, ...members);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, member);
    return result === 1;
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  async scard(key: string): Promise<number> {
    return this.redisClient.scard(key);
  }

  async sremAll(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
