import { Test, TestingModule } from '@nestjs/testing';
import { BalanceLedgerPortRepository } from '@app/auth-service/application/ports/balance-ledger.port.repository';
import { PrismaService } from '../prisma.service';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';
import { BalanceLedgerEntry } from '@app/auth-service/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';
import BigNumber from 'bignumber.js';
import { v4 as uuidv4 } from 'uuid';

describe('BalanceLedgerPrismaRepository (Integration)', () => {
  let repository: BalanceLedgerPortRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    repository = module.get<BalanceLedgerPortRepository>(
      BalanceLedgerPortRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // Order matters due to foreign key constraints: UserBalance references BalanceResult tables
    await prisma.userBalance.deleteMany({});
    await prisma.cryptoBalanceResult.deleteMany({});
    await prisma.bonusBalanceResult.deleteMany({});
    await prisma.fiatBalanceResult.deleteMany({});
    // Ledger tables are independent, can be deleted in any order
    await prisma.cryptoBalanceLedger.deleteMany({});
    await prisma.bonusBalanceLedger.deleteMany({});
    await prisma.fiatBalanceLedger.deleteMany({});
  });

  describe('create', () => {
    it('should create FIAT balance ledger entry', async () => {
      const createData = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const entry = await repository.create(createData, CurrencyType.FIAT);

      expect(entry).toBeInstanceOf(BalanceLedgerEntry);
      expect(entry.userId).toEqual(new BigNumber(1));
      expect(entry.operationId).toBe('op-123');
      expect(entry.currencyType).toBe(CurrencyType.FIAT);
      expect(entry.amount.toUnitString()).toBe('100000');
      expect(entry.operationType).toBe(OperationType.ADD);
      expect(entry.operationStatus).toBe(OperationStatus.COMPLETED);
      expect(entry.reason).toBe(LedgerReason.PAYMENTS_DEPOSIT);
    });

    it('should create BONUS balance ledger entry', async () => {
      const createData = {
        userId: new BigNumber(2),
        operationId: 'op-456',
        currencyType: CurrencyType.BONUS,
        amount: BalanceAmount.fromUnit(50000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.GAMES_WIN,
      };

      const entry = await repository.create(createData, CurrencyType.BONUS);

      expect(entry.currencyType).toBe(CurrencyType.BONUS);
      expect(entry.amount.toUnitString()).toBe('50000');
    });

    it('should create CRYPTO balance ledger entry', async () => {
      const createData = {
        userId: new BigNumber(3),
        operationId: 'op-789',
        currencyType: CurrencyType.CRYPTO,
        amount: BalanceAmount.fromUnit(200000),
        operationType: OperationType.SUBTRACT,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_WITHDRAWAL,
      };

      const entry = await repository.create(createData, CurrencyType.CRYPTO);

      expect(entry.currencyType).toBe(CurrencyType.CRYPTO);
      expect(entry.amount.toUnitString()).toBe('200000');
      expect(entry.operationType).toBe(OperationType.SUBTRACT);
    });

    it('should create ledger entry with custom id', async () => {
      const customId = uuidv4();
      const createData = {
        id: customId,
        userId: new BigNumber(4),
        operationId: 'op-custom',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const entry = await repository.create(createData, CurrencyType.FIAT);

      expect(entry.id).toBe(customId);
    });
  });

  describe('findByOperationId', () => {
    it('should find FIAT ledger entry by operationId', async () => {
      const userId = new BigNumber(10);
      const operationId = 'op-find-123';

      await repository.create(
        {
          userId,
          operationId,
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      const found = await repository.findByOperationId(
        userId,
        operationId,
        CurrencyType.FIAT,
      );

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(BalanceLedgerEntry);
      expect(found!.operationId).toBe(operationId);
    });

    it('should find BONUS ledger entry by operationId', async () => {
      const userId = new BigNumber(11);
      const operationId = 'op-find-456';

      await repository.create(
        {
          userId,
          operationId,
          currencyType: CurrencyType.BONUS,
          amount: BalanceAmount.fromUnit(50000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.GAMES_WIN,
        },
        CurrencyType.BONUS,
      );

      const found = await repository.findByOperationId(
        userId,
        operationId,
        CurrencyType.BONUS,
      );

      expect(found).not.toBeNull();
      expect(found!.operationId).toBe(operationId);
    });

    it('should return null when ledger entry does not exist', async () => {
      const found = await repository.findByOperationId(
        new BigNumber(999),
        'non-existent',
        CurrencyType.FIAT,
      );

      expect(found).toBeNull();
    });

    it('should return null for different currency type', async () => {
      const userId = new BigNumber(12);
      const operationId = 'op-currency-test';

      await repository.create(
        {
          userId,
          operationId,
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      const found = await repository.findByOperationId(
        userId,
        operationId,
        CurrencyType.BONUS,
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all ledger entries for userId with FIAT currency', async () => {
      const userId = new BigNumber(20);

      await repository.create(
        {
          userId,
          operationId: 'op-1',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      await repository.create(
        {
          userId,
          operationId: 'op-2',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(50000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      const entries = await repository.findByUserId(userId, CurrencyType.FIAT);

      expect(entries).toHaveLength(2);
      expect(entries[0].operationId).toBe('op-1');
      expect(entries[1].operationId).toBe('op-2');
    });

    it('should respect limit parameter', async () => {
      const userId = new BigNumber(21);

      // Create 5 entries
      for (let i = 1; i <= 5; i++) {
        await repository.create(
          {
            userId,
            operationId: `op-limit-${i}`,
            currencyType: CurrencyType.FIAT,
            amount: BalanceAmount.fromUnit(100000),
            operationType: OperationType.ADD,
            operationStatus: OperationStatus.COMPLETED,
            reason: LedgerReason.PAYMENTS_DEPOSIT,
          },
          CurrencyType.FIAT,
        );
      }

      const entries = await repository.findByUserId(
        userId,
        CurrencyType.FIAT,
        3,
      );

      expect(entries).toHaveLength(3);
    });

    it('should respect offset parameter', async () => {
      const userId = new BigNumber(22);

      // Create 5 entries
      for (let i = 1; i <= 5; i++) {
        await repository.create(
          {
            userId,
            operationId: `op-offset-${i}`,
            currencyType: CurrencyType.FIAT,
            amount: BalanceAmount.fromUnit(100000),
            operationType: OperationType.ADD,
            operationStatus: OperationStatus.COMPLETED,
            reason: LedgerReason.PAYMENTS_DEPOSIT,
          },
          CurrencyType.FIAT,
        );
      }

      const entries = await repository.findByUserId(
        userId,
        CurrencyType.FIAT,
        3,
        2,
      );

      expect(entries).toHaveLength(3);
      expect(entries[0].operationId).toBe('op-offset-3');
    });

    it('should return entries ordered by createdAt ascending', async () => {
      const userId = new BigNumber(23);

      await repository.create(
        {
          userId,
          operationId: 'op-first',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await repository.create(
        {
          userId,
          operationId: 'op-second',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(200000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      const entries = await repository.findByUserId(userId, CurrencyType.FIAT);

      expect(entries).toHaveLength(2);
      expect(entries[0].operationId).toBe('op-first');
      expect(entries[1].operationId).toBe('op-second');
    });
  });

  describe('findAfterLedgerId', () => {
    it('should find ledger entries after specified ledgerId', async () => {
      const userId = new BigNumber(30);
      const entryIds: string[] = [];

      // Create 5 entries
      for (let i = 1; i <= 5; i++) {
        const entry = await repository.create(
          {
            userId,
            operationId: `op-after-${i}`,
            currencyType: CurrencyType.FIAT,
            amount: BalanceAmount.fromUnit(100000),
            operationType: OperationType.ADD,
            operationStatus: OperationStatus.COMPLETED,
            reason: LedgerReason.PAYMENTS_DEPOSIT,
          },
          CurrencyType.FIAT,
        );
        entryIds.push(entry.id);
      }

      const entries = await repository.findAfterLedgerId(
        userId,
        CurrencyType.FIAT,
        entryIds[1], // Start after second entry
      );

      // Should return entries created after the second entry (entries 3, 4, 5)
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.length).toBe(3);
      // Should not include the second entry itself
      expect(entries.every((e) => e.id !== entryIds[1])).toBe(true);
      // Should not include the first entry
      expect(entries.every((e) => e.id !== entryIds[0])).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const userId = new BigNumber(31);

      // Create 10 entries
      for (let i = 1; i <= 10; i++) {
        await repository.create(
          {
            userId,
            operationId: `op-limit-after-${i}`,
            currencyType: CurrencyType.FIAT,
            amount: BalanceAmount.fromUnit(100000),
            operationType: OperationType.ADD,
            operationStatus: OperationStatus.COMPLETED,
            reason: LedgerReason.PAYMENTS_DEPOSIT,
          },
          CurrencyType.FIAT,
        );
      }

      const firstEntry = await repository.findByUserId(
        userId,
        CurrencyType.FIAT,
        1,
      );

      const entries = await repository.findAfterLedgerId(
        userId,
        CurrencyType.FIAT,
        firstEntry[0].id,
        3,
      );

      expect(entries).toHaveLength(3);
    });

    it('should use default limit of 1000', async () => {
      const userId = new BigNumber(32);

      // Create 5 entries
      for (let i = 1; i <= 5; i++) {
        await repository.create(
          {
            userId,
            operationId: `op-default-limit-${i}`,
            currencyType: CurrencyType.FIAT,
            amount: BalanceAmount.fromUnit(100000),
            operationType: OperationType.ADD,
            operationStatus: OperationStatus.COMPLETED,
            reason: LedgerReason.PAYMENTS_DEPOSIT,
          },
          CurrencyType.FIAT,
        );
      }

      const firstEntry = await repository.findByUserId(
        userId,
        CurrencyType.FIAT,
        1,
      );

      const entries = await repository.findAfterLedgerId(
        userId,
        CurrencyType.FIAT,
        firstEntry[0].id,
      );

      expect(entries.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('countByUserId', () => {
    it('should count FIAT ledger entries for userId', async () => {
      const userId = new BigNumber(40);

      await repository.create(
        {
          userId,
          operationId: 'op-count-1',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      await repository.create(
        {
          userId,
          operationId: 'op-count-2',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(50000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      const count = await repository.countByUserId(userId, CurrencyType.FIAT);

      expect(count).toBe(2);
    });

    it('should count BONUS ledger entries for userId', async () => {
      const userId = new BigNumber(41);

      await repository.create(
        {
          userId,
          operationId: 'op-bonus-1',
          currencyType: CurrencyType.BONUS,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.GAMES_WIN,
        },
        CurrencyType.BONUS,
      );

      const count = await repository.countByUserId(userId, CurrencyType.BONUS);

      expect(count).toBe(1);
    });

    it('should return 0 when no entries exist', async () => {
      const count = await repository.countByUserId(
        new BigNumber(999),
        CurrencyType.FIAT,
      );

      expect(count).toBe(0);
    });

    it('should only count entries for specified currency type', async () => {
      const userId = new BigNumber(42);

      // Create FIAT entries
      await repository.create(
        {
          userId,
          operationId: 'op-fiat-1',
          currencyType: CurrencyType.FIAT,
          amount: BalanceAmount.fromUnit(100000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.PAYMENTS_DEPOSIT,
        },
        CurrencyType.FIAT,
      );

      // Create BONUS entry
      await repository.create(
        {
          userId,
          operationId: 'op-bonus-1',
          currencyType: CurrencyType.BONUS,
          amount: BalanceAmount.fromUnit(50000),
          operationType: OperationType.ADD,
          operationStatus: OperationStatus.COMPLETED,
          reason: LedgerReason.GAMES_WIN,
        },
        CurrencyType.BONUS,
      );

      const fiatCount = await repository.countByUserId(
        userId,
        CurrencyType.FIAT,
      );
      const bonusCount = await repository.countByUserId(
        userId,
        CurrencyType.BONUS,
      );

      expect(fiatCount).toBe(1);
      expect(bonusCount).toBe(1);
    });
  });
});
