import BigNumber from 'bignumber.js';
import { BalanceResultPrismaMapper } from './balance-result.prisma.mapper';
import { BalanceResult } from '@app/balance/domain/entities/balance-result/balance-result';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import {
  FiatBalanceResult,
  BonusBalanceResult,
  CryptoBalanceResult,
} from '@prisma/balance';

// Mock Prisma BalanceResult type structure
type MockPrismaBalanceResult = {
  id: string;
  userId: bigint;
  balance: bigint;
  currencyIsoCode: string;
  lastCalculatedAt: Date;
  lastLedgerId: string | null;
};

describe('BalanceResultPrismaMapper', () => {
  const createMockPrismaBalanceResult = (
    overrides?: Partial<MockPrismaBalanceResult>,
  ): MockPrismaBalanceResult => {
    return {
      id: 'balance-result-1',
      userId: BigInt(1),
      balance: BigInt(100000), // 1000.00 in unit format
      currencyIsoCode: 'USD',
      lastCalculatedAt: new Date('2024-01-01'),
      lastLedgerId: null,
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('should map Prisma balance result to domain balance result with all fields', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult();
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult).toBeInstanceOf(BalanceResult);
      expect(domainBalanceResult.id).toBe('balance-result-1');
      expect(domainBalanceResult.userId).toEqual(new BigNumber(1));
      expect(domainBalanceResult.balance).toBeInstanceOf(BalanceAmount);
      expect(domainBalanceResult.balance.toUnitString()).toBe('100000');
      expect(domainBalanceResult.currencyIsoCode).toBe('USD');
      expect(domainBalanceResult.lastCalculatedAt).toEqual(
        new Date('2024-01-01'),
      );
      expect(domainBalanceResult.lastLedgerId).toBeUndefined();
    });

    it('should convert BigInt balance to BalanceAmount correctly', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult({
        balance: BigInt(500000), // 5000.00
      });
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult.balance.toUnitString()).toBe('500000');
    });

    it('should convert null lastLedgerId to undefined', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult({
        lastLedgerId: null,
      });
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult.lastLedgerId).toBeUndefined();
    });

    it('should preserve lastLedgerId when present', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult({
        lastLedgerId: 'ledger-entry-123',
      });
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult.lastLedgerId).toBe('ledger-entry-123');
    });

    it('should handle zero balance', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult({
        balance: BigInt(0),
      });
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult.balance.toUnitString()).toBe('0');
      expect(domainBalanceResult.balance.isZero()).toBe(true);
    });

    it('should handle large balance values', () => {
      const prismaBalanceResult = createMockPrismaBalanceResult({
        balance: BigInt('999999999999999999'), // Very large number
      });
      const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
        prismaBalanceResult as FiatBalanceResult,
      );

      expect(domainBalanceResult.balance.toUnitString()).toBe(
        '999999999999999999',
      );
    });

    it('should work with different currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'BTC'];
      currencies.forEach((currency) => {
        const prismaBalanceResult = createMockPrismaBalanceResult({
          currencyIsoCode: currency,
        });
        const domainBalanceResult = BalanceResultPrismaMapper.toDomain(
          prismaBalanceResult as FiatBalanceResult,
        );

        expect(domainBalanceResult.currencyIsoCode).toBe(currency);
      });
    });

    it('should work with all result types (Fiat, Bonus, Crypto)', () => {
      const fiatResult = createMockPrismaBalanceResult({
        id: 'fiat-1',
        currencyIsoCode: 'USD',
      });
      const bonusResult = createMockPrismaBalanceResult({
        id: 'bonus-1',
        currencyIsoCode: 'USD',
      });
      const cryptoResult = createMockPrismaBalanceResult({
        id: 'crypto-1',
        currencyIsoCode: 'BTC',
      });

      const fiatDomain = BalanceResultPrismaMapper.toDomain(
        fiatResult as FiatBalanceResult,
      );
      const bonusDomain = BalanceResultPrismaMapper.toDomain(
        bonusResult as BonusBalanceResult,
      );
      const cryptoDomain = BalanceResultPrismaMapper.toDomain(
        cryptoResult as CryptoBalanceResult,
      );

      expect(fiatDomain.id).toBe('fiat-1');
      expect(bonusDomain.id).toBe('bonus-1');
      expect(cryptoDomain.id).toBe('crypto-1');
    });
  });

  describe('toPrismaCreate', () => {
    it('should map domain balance result to Prisma create input with all fields', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
        lastLedgerId: 'ledger-entry-123',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.userId).toEqual(BigInt(1));
      expect(prismaInput.balance).toEqual(BigInt(100000));
      expect(prismaInput.currencyIsoCode).toBe('USD');
      expect(prismaInput.lastLedgerId).toBe('ledger-entry-123');
    });

    it('should convert BalanceAmount to BigInt correctly', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(500000),
        currencyIsoCode: 'USD',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.balance).toEqual(BigInt(500000));
    });

    it('should include id when provided', () => {
      const createBalanceResult = {
        id: 'custom-balance-id',
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.id).toBe('custom-balance-id');
    });

    it('should exclude id when not provided', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.id).toBeUndefined();
    });

    it('should convert undefined lastLedgerId to null', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
        lastLedgerId: undefined,
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.lastLedgerId).toBeNull();
    });

    it('should preserve lastLedgerId when provided', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
        lastLedgerId: 'ledger-456',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.lastLedgerId).toBe('ledger-456');
    });

    it('should handle zero balance', () => {
      const createBalanceResult = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(0),
        currencyIsoCode: 'USD',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaCreate(createBalanceResult);

      expect(prismaInput.balance).toEqual(BigInt(0));
    });
  });

  describe('toPrismaUpdate', () => {
    it('should map domain balance result update to Prisma update input with all fields', () => {
      const updateBalanceResult = {
        balance: BalanceAmount.fromUnit(200000),
        lastCalculatedAt: new Date('2024-02-01'),
        lastLedgerId: 'ledger-entry-456',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaUpdate(updateBalanceResult);

      expect(prismaInput.balance).toEqual(BigInt(200000));
      expect(prismaInput.lastCalculatedAt).toEqual(new Date('2024-02-01'));
      expect(prismaInput.lastLedgerId).toBe('ledger-entry-456');
    });

    it('should convert BalanceAmount to BigInt correctly', () => {
      const updateBalanceResult = {
        balance: BalanceAmount.fromUnit(750000),
        lastCalculatedAt: new Date('2024-02-01'),
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaUpdate(updateBalanceResult);

      expect(prismaInput.balance).toEqual(BigInt(750000));
    });

    it('should convert undefined lastLedgerId to null', () => {
      const updateBalanceResult = {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: new Date('2024-02-01'),
        lastLedgerId: undefined,
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaUpdate(updateBalanceResult);

      expect(prismaInput.lastLedgerId).toBeNull();
    });

    it('should preserve lastLedgerId when provided', () => {
      const updateBalanceResult = {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: new Date('2024-02-01'),
        lastLedgerId: 'ledger-789',
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaUpdate(updateBalanceResult);

      expect(prismaInput.lastLedgerId).toBe('ledger-789');
    });

    it('should handle partial updates', () => {
      const updateBalanceResult = {
        balance: BalanceAmount.fromUnit(300000),
        lastCalculatedAt: new Date('2024-03-01'),
      };

      const prismaInput =
        BalanceResultPrismaMapper.toPrismaUpdate(updateBalanceResult);

      expect(prismaInput.balance).toEqual(BigInt(300000));
      expect(prismaInput.lastCalculatedAt).toEqual(new Date('2024-03-01'));
      expect(prismaInput.lastLedgerId).toBeNull();
    });
  });
});
