import { Test, TestingModule } from '@nestjs/testing';
import { BalanceResultPortRepository } from '@app/auth-service/application/ports/balance-result.port.repository';
import { PrismaService } from '../prisma.service';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';
import { BalanceResult } from '@app/auth-service/domain/entities/balance-result/balance-result';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import BigNumber from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';

describe('BalanceResultPrismaRepository (Integration)', () => {
  let repository: BalanceResultPortRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    repository = module.get<BalanceResultPortRepository>(
      BalanceResultPortRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.userBalance.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
  });

  describe('create', () => {
    it('should create FIAT balance result', async () => {
      const createData = {
        userId: new BigNumber(1),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      };

      const result = await repository.create(createData, CurrencyType.FIAT);

      expect(result).toBeInstanceOf(BalanceResult);
      expect(result.userId).toEqual(new BigNumber(1));
      expect(result.balance.toUnitString()).toBe('100000');
      expect(result.currencyIsoCode).toBe('USD');
    });

    it('should create BONUS balance result', async () => {
      const createData = {
        userId: new BigNumber(2),
        balance: BalanceAmount.fromUnit(50000),
        currencyIsoCode: 'USD',
      };

      const result = await repository.create(createData, CurrencyType.BONUS);

      expect(result).toBeInstanceOf(BalanceResult);
      expect(result.userId).toEqual(new BigNumber(2));
      expect(result.balance.toUnitString()).toBe('50000');
      expect(result.currencyIsoCode).toBe('USD');
    });

    it('should create CRYPTO balance result', async () => {
      const createData = {
        userId: new BigNumber(3),
        balance: BalanceAmount.fromUnit(200000),
        currencyIsoCode: 'BTC',
      };

      const result = await repository.create(createData, CurrencyType.CRYPTO);

      expect(result).toBeInstanceOf(BalanceResult);
      expect(result.userId).toEqual(new BigNumber(3));
      expect(result.balance.toUnitString()).toBe('200000');
      expect(result.currencyIsoCode).toBe('BTC');
    });

    it('should create balance result with custom id', async () => {
      const customId = uuidv4();
      const createData = {
        id: customId,
        userId: new BigNumber(4),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      };

      const result = await repository.create(createData, CurrencyType.FIAT);

      expect(result.id).toBe(customId);
    });

    it('should create balance result with lastLedgerId', async () => {
      const lastLedgerId = uuidv4();
      const createData = {
        userId: new BigNumber(5),
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
        lastLedgerId,
      };

      const result = await repository.create(createData, CurrencyType.FIAT);

      expect(result.lastLedgerId).toBe(lastLedgerId);
    });
  });

  describe('findByUserId', () => {
    it('should find FIAT balance result by userId', async () => {
      const userId = new BigNumber(10);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const found = await repository.findByUserId(userId, CurrencyType.FIAT);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(BalanceResult);
      expect(found!.userId).toEqual(userId);
      expect(found!.balance.toUnitString()).toBe('100000');
    });

    it('should find BONUS balance result by userId', async () => {
      const userId = new BigNumber(11);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(50000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.BONUS,
      );

      const found = await repository.findByUserId(userId, CurrencyType.BONUS);

      expect(found).not.toBeNull();
      expect(found!.balance.toUnitString()).toBe('50000');
    });

    it('should find CRYPTO balance result by userId', async () => {
      const userId = new BigNumber(12);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(200000),
          currencyIsoCode: 'BTC',
        },
        CurrencyType.CRYPTO,
      );

      const found = await repository.findByUserId(userId, CurrencyType.CRYPTO);

      expect(found).not.toBeNull();
      expect(found!.balance.toUnitString()).toBe('200000');
    });

    it('should return null when balance result does not exist', async () => {
      const found = await repository.findByUserId(
        new BigNumber(999),
        CurrencyType.FIAT,
      );

      expect(found).toBeNull();
    });

    it('should return null for different currency type', async () => {
      const userId = new BigNumber(13);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const found = await repository.findByUserId(userId, CurrencyType.BONUS);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update balance', async () => {
      const userId = new BigNumber(20);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const updated = await repository.update(userId, CurrencyType.FIAT, {
        balance: BalanceAmount.fromUnit(200000),
        lastCalculatedAt: new Date('2024-02-01'),
      });

      expect(updated.balance.toUnitString()).toBe('200000');
      expect(updated.lastCalculatedAt).toEqual(new Date('2024-02-01'));
    });

    it('should update lastCalculatedAt', async () => {
      const userId = new BigNumber(21);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const newDate = new Date('2024-03-01');
      const updated = await repository.update(userId, CurrencyType.FIAT, {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: newDate,
      });

      expect(updated.lastCalculatedAt).toEqual(newDate);
    });

    it('should update lastLedgerId', async () => {
      const userId = new BigNumber(22);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const lastLedgerId = uuidv4();
      const updated = await repository.update(userId, CurrencyType.FIAT, {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: new Date(),
        lastLedgerId,
      });

      expect(updated.lastLedgerId).toBe(lastLedgerId);
    });

    it('should update lastLedgerId to undefined (null)', async () => {
      const userId = new BigNumber(23);
      const initialLastLedgerId = uuidv4();
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
          lastLedgerId: initialLastLedgerId,
        },
        CurrencyType.FIAT,
      );

      const updated = await repository.update(userId, CurrencyType.FIAT, {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: new Date(),
        lastLedgerId: undefined,
      });

      expect(updated.lastLedgerId).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should create balance result when it does not exist', async () => {
      const userId = new BigNumber(30);
      const createData = {
        userId,
        balance: BalanceAmount.fromUnit(100000),
        currencyIsoCode: 'USD',
      };
      const updateData = {
        balance: BalanceAmount.fromUnit(100000),
        lastCalculatedAt: new Date(),
      };

      const result = await repository.upsert(
        userId,
        CurrencyType.FIAT,
        createData,
        updateData,
      );

      expect(result).toBeInstanceOf(BalanceResult);
      expect(result.userId).toEqual(userId);
      expect(result.balance.toUnitString()).toBe('100000');
    });

    it('should update balance result when it exists', async () => {
      const userId = new BigNumber(31);
      await repository.create(
        {
          userId,
          balance: BalanceAmount.fromUnit(100000),
          currencyIsoCode: 'USD',
        },
        CurrencyType.FIAT,
      );

      const createData = {
        userId,
        balance: BalanceAmount.fromUnit(0),
        currencyIsoCode: 'USD',
      };
      const updateData = {
        balance: BalanceAmount.fromUnit(200000),
        lastCalculatedAt: new Date('2024-02-01'),
      };

      const result = await repository.upsert(
        userId,
        CurrencyType.FIAT,
        createData,
        updateData,
      );

      expect(result.balance.toUnitString()).toBe('200000');
      expect(result.lastCalculatedAt).toEqual(new Date('2024-02-01'));
    });
  });
});
