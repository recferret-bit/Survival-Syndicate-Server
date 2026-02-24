import { Test, TestingModule } from '@nestjs/testing';
import BigNumber from 'bignumber.js';
import { CurrencyRateCacheReader } from './currency-rate-cache.reader';
import { RedisService } from '@lib/shared/redis';

describe('CurrencyRateCacheReader', () => {
  let reader: CurrencyRateCacheReader;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    redisService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyRateCacheReader,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    reader = module.get<CurrencyRateCacheReader>(CurrencyRateCacheReader);
  });

  it('should return rate when Redis has cached value', async () => {
    redisService.get.mockResolvedValue({
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      date: '2025-02-20',
      rate: '1.08',
    });

    const result = await reader.getRate('EUR', 'USD', new Date('2025-02-20'));

    expect(result).toBeInstanceOf(BigNumber);
    expect(result?.toString()).toBe('1.08');
    expect(redisService.get).toHaveBeenCalledWith(
      'currency-rate:EUR:USD:2025-02-20',
    );
  });

  it('should return null when Redis returns null', async () => {
    redisService.get.mockResolvedValue(null);

    const result = await reader.getRate('EUR', 'USD', new Date('2025-02-20'));

    expect(result).toBeNull();
  });

  it('should return null when Redis returns empty rate', async () => {
    redisService.get.mockResolvedValue({
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      date: '2025-02-20',
      rate: '',
    });

    const result = await reader.getRate('EUR', 'USD', new Date('2025-02-20'));

    expect(result).toBeNull();
  });

  it('should return null when Redis throws', async () => {
    redisService.get.mockRejectedValue(new Error('Redis error'));

    const result = await reader.getRate('EUR', 'USD', new Date('2025-02-20'));

    expect(result).toBeNull();
  });
});
