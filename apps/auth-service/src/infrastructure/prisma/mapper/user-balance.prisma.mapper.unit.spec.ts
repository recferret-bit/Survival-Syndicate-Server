import BigNumber from 'bignumber.js';
import { UserBalancePrismaMapper } from './user-balance.prisma.mapper';
import { UserBalance } from '@app/auth-service/domain/entities/user-balance/user-balance';
import { BalanceResultPrismaMapper } from './balance-result.prisma.mapper';
import { Prisma } from '@prisma/catalog';

// Mock Prisma UserBalance type structure with relations
type MockPrismaUserBalance = {
  id: string;
  userId: bigint;
  fiatBalanceId: string;
  bonusBalanceId: string;
  cryptoBalanceId: string | null;
  fiatBalance: {
    id: string;
    userId: bigint;
    balance: bigint;
    currencyIsoCode: string;
    lastCalculatedAt: Date;
    lastLedgerId: string | null;
  };
  bonusBalance: {
    id: string;
    userId: bigint;
    balance: bigint;
    currencyIsoCode: string;
    lastCalculatedAt: Date;
    lastLedgerId: string | null;
  };
  cryptoBalance: {
    id: string;
    userId: bigint;
    balance: bigint;
    currencyIsoCode: string;
    lastCalculatedAt: Date;
    lastLedgerId: string | null;
  } | null;
};

// Mock BalanceResultPrismaMapper.toDomain
jest.mock('./balance-result.prisma.mapper', () => ({
  BalanceResultPrismaMapper: {
    toDomain: jest.fn(),
  },
}));

describe('UserBalancePrismaMapper', () => {
  const createMockPrismaUserBalance = (
    overrides?: Partial<MockPrismaUserBalance>,
  ): MockPrismaUserBalance => {
    const defaultFiatBalance = {
      id: 'fiat-balance-1',
      userId: BigInt(1),
      balance: BigInt(100000), // 1000.00 in unit format
      currencyIsoCode: 'USD',
      lastCalculatedAt: new Date('2024-01-01'),
      lastLedgerId: null,
    };

    const defaultBonusBalance = {
      id: 'bonus-balance-1',
      userId: BigInt(1),
      balance: BigInt(50000), // 500.00 in unit format
      currencyIsoCode: 'USD',
      lastCalculatedAt: new Date('2024-01-01'),
      lastLedgerId: null,
    };

    const defaultCryptoBalance = {
      id: 'crypto-balance-1',
      userId: BigInt(1),
      balance: BigInt(200000), // 2000.00 in unit format
      currencyIsoCode: 'USD',
      lastCalculatedAt: new Date('2024-01-01'),
      lastLedgerId: null,
    };

    return {
      id: 'user-balance-1',
      userId: BigInt(1),
      fiatBalanceId: 'fiat-balance-1',
      bonusBalanceId: 'bonus-balance-1',
      cryptoBalanceId: 'crypto-balance-1',
      fiatBalance: defaultFiatBalance,
      bonusBalance: defaultBonusBalance,
      cryptoBalance: defaultCryptoBalance,
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock BalanceResultPrismaMapper.toDomain to return a mock BalanceResult
    (BalanceResultPrismaMapper.toDomain as jest.Mock).mockImplementation(
      (entity) => {
        return {
          id: entity.id,
          userId: entity.userId,
          balance: { toUnitString: () => entity.balance.toString() },
          currencyIsoCode: entity.currencyIsoCode,
          lastCalculatedAt: entity.lastCalculatedAt,
          lastLedgerId: entity.lastLedgerId || undefined,
        };
      },
    );
  });

  describe('toDomain', () => {
    it('should map Prisma user balance to domain user balance with all fields', () => {
      const prismaUserBalance = createMockPrismaUserBalance();
      const domainUserBalance = UserBalancePrismaMapper.toDomain(
        prismaUserBalance as Prisma.UserBalanceGetPayload<{
          include: {
            fiatBalance: true;
            bonusBalance: true;
            cryptoBalance: true;
          };
        }>,
      );

      expect(domainUserBalance).toBeInstanceOf(UserBalance);
      expect(domainUserBalance.id).toBe('user-balance-1');
      expect(domainUserBalance.userId).toEqual(new BigNumber(1));
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledWith(
        prismaUserBalance.fiatBalance,
      );
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledWith(
        prismaUserBalance.bonusBalance,
      );
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledWith(
        prismaUserBalance.cryptoBalance,
      );
    });

    it('should handle null cryptoBalance', () => {
      const prismaUserBalance = createMockPrismaUserBalance({
        cryptoBalance: null,
        cryptoBalanceId: null,
      });
      const domainUserBalance = UserBalancePrismaMapper.toDomain(
        prismaUserBalance as Prisma.UserBalanceGetPayload<{
          include: {
            fiatBalance: true;
            bonusBalance: true;
            cryptoBalance: true;
          };
        }>,
      );

      expect(domainUserBalance).toBeInstanceOf(UserBalance);
      expect(domainUserBalance.cryptoBalance).toBeUndefined();
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledTimes(2); // Only fiat and bonus
      expect(BalanceResultPrismaMapper.toDomain).not.toHaveBeenCalledWith(null);
    });

    it('should map all relation fields correctly', () => {
      const prismaUserBalance = createMockPrismaUserBalance({
        id: 'user-balance-2',
        userId: BigInt(999),
        fiatBalance: {
          id: 'fiat-balance-2',
          userId: BigInt(999),
          balance: BigInt(500000),
          currencyIsoCode: 'EUR',
          lastCalculatedAt: new Date('2024-02-01'),
          lastLedgerId: 'ledger-123',
        },
        bonusBalance: {
          id: 'bonus-balance-2',
          userId: BigInt(999),
          balance: BigInt(250000),
          currencyIsoCode: 'EUR',
          lastCalculatedAt: new Date('2024-02-01'),
          lastLedgerId: null,
        },
      });

      const domainUserBalance = UserBalancePrismaMapper.toDomain(
        prismaUserBalance as Prisma.UserBalanceGetPayload<{
          include: {
            fiatBalance: true;
            bonusBalance: true;
            cryptoBalance: true;
          };
        }>,
      );

      expect(domainUserBalance.id).toBe('user-balance-2');
      expect(domainUserBalance.userId).toEqual(new BigNumber(999));
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledWith(
        prismaUserBalance.fiatBalance,
      );
      expect(BalanceResultPrismaMapper.toDomain).toHaveBeenCalledWith(
        prismaUserBalance.bonusBalance,
      );
    });
  });

  describe('toPrisma', () => {
    it('should map domain user balance to Prisma input with all fields', () => {
      const createUserBalance = {
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        cryptoBalanceId: 'crypto-balance-1',
      };

      const prismaInput = UserBalancePrismaMapper.toPrisma(createUserBalance);

      expect(prismaInput.userId).toEqual(BigInt(1));
      expect(prismaInput.fiatBalanceId).toBe('fiat-balance-1');
      expect(prismaInput.bonusBalanceId).toBe('bonus-balance-1');
      expect(prismaInput.cryptoBalanceId).toBe('crypto-balance-1');
    });

    it('should include id when provided', () => {
      const createUserBalance = {
        id: 'user-balance-custom',
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        cryptoBalanceId: 'crypto-balance-1',
      };

      const prismaInput = UserBalancePrismaMapper.toPrisma(createUserBalance);

      expect(prismaInput.id).toBe('user-balance-custom');
    });

    it('should exclude id when not provided', () => {
      const createUserBalance = {
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        cryptoBalanceId: 'crypto-balance-1',
      };

      const prismaInput = UserBalancePrismaMapper.toPrisma(createUserBalance);

      expect(prismaInput.id).toBeUndefined();
    });

    it('should throw error when cryptoBalanceId is missing', () => {
      const createUserBalance = {
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        // cryptoBalanceId is missing
      };

      expect(() => {
        UserBalancePrismaMapper.toPrisma(createUserBalance as any);
      }).toThrow(
        'cryptoBalanceId is required. Please create a CryptoBalanceResult first.',
      );
    });

    it('should throw error when cryptoBalanceId is undefined', () => {
      const createUserBalance = {
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        cryptoBalanceId: undefined,
      };

      expect(() => {
        UserBalancePrismaMapper.toPrisma(createUserBalance as any);
      }).toThrow(
        'cryptoBalanceId is required. Please create a CryptoBalanceResult first.',
      );
    });

    it('should handle optional cryptoBalanceId when provided', () => {
      const createUserBalance = {
        userId: new BigNumber(1),
        fiatBalanceId: 'fiat-balance-1',
        bonusBalanceId: 'bonus-balance-1',
        cryptoBalanceId: 'crypto-balance-1',
      };

      const prismaInput = UserBalancePrismaMapper.toPrisma(createUserBalance);

      expect(prismaInput.cryptoBalanceId).toBe('crypto-balance-1');
    });
  });
});
