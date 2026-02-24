import BigNumber from 'bignumber.js';
import { BalanceLedgerPrismaMapper } from './balance-ledger.prisma.mapper';
import { BalanceLedgerEntry } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';
import {
  FiatBalanceLedger,
  BonusBalanceLedger,
  CryptoBalanceLedger,
} from '@prisma/balance';

// Mock Prisma BalanceLedger type structure
type MockPrismaBalanceLedger = {
  id: string;
  userId: bigint;
  operationId: string;
  amount: bigint;
  operationType: string;
  operationStatus: string;
  reason: string;
  createdAt: Date;
};

describe('BalanceLedgerPrismaMapper', () => {
  const createMockPrismaBalanceLedger = (
    overrides?: Partial<MockPrismaBalanceLedger>,
  ): MockPrismaBalanceLedger => {
    return {
      id: 'ledger-entry-1',
      userId: BigInt(1),
      operationId: 'op-123',
      amount: BigInt(100000), // 1000.00 in unit format
      operationType: OperationType.ADD,
      operationStatus: OperationStatus.COMPLETED,
      reason: LedgerReason.PAYMENTS_DEPOSIT,
      createdAt: new Date('2024-01-01'),
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('should map Prisma balance ledger to domain balance ledger with all fields for FIAT', () => {
      const prismaLedger = createMockPrismaBalanceLedger();
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as FiatBalanceLedger,
        CurrencyType.FIAT,
      );

      expect(domainLedger).toBeInstanceOf(BalanceLedgerEntry);
      expect(domainLedger.id).toBe('ledger-entry-1');
      expect(domainLedger.userId).toEqual(new BigNumber(1));
      expect(domainLedger.operationId).toBe('op-123');
      expect(domainLedger.currencyType).toBe(CurrencyType.FIAT);
      expect(domainLedger.amount).toBeInstanceOf(BalanceAmount);
      expect(domainLedger.amount.toUnitString()).toBe('100000');
      expect(domainLedger.operationType).toBe(OperationType.ADD);
      expect(domainLedger.operationStatus).toBe(OperationStatus.COMPLETED);
      expect(domainLedger.reason).toBe(LedgerReason.PAYMENTS_DEPOSIT);
      expect(domainLedger.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('should map Prisma balance ledger for BONUS currency type', () => {
      const prismaLedger = createMockPrismaBalanceLedger();
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as BonusBalanceLedger,
        CurrencyType.BONUS,
      );

      expect(domainLedger.currencyType).toBe(CurrencyType.BONUS);
    });

    it('should map Prisma balance ledger for CRYPTO currency type', () => {
      const prismaLedger = createMockPrismaBalanceLedger();
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as CryptoBalanceLedger,
        CurrencyType.CRYPTO,
      );

      expect(domainLedger.currencyType).toBe(CurrencyType.CRYPTO);
    });

    it('should convert BigInt amount to BalanceAmount correctly', () => {
      const prismaLedger = createMockPrismaBalanceLedger({
        amount: BigInt(500000), // 5000.00
      });
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as FiatBalanceLedger,
        CurrencyType.FIAT,
      );

      expect(domainLedger.amount.toUnitString()).toBe('500000');
    });

    it('should map all OperationType enum values', () => {
      const operationTypes = [OperationType.ADD, OperationType.SUBTRACT];

      operationTypes.forEach((operationType) => {
        const prismaLedger = createMockPrismaBalanceLedger({
          operationType,
        });
        const domainLedger = BalanceLedgerPrismaMapper.toDomain(
          prismaLedger as FiatBalanceLedger,
          CurrencyType.FIAT,
        );

        expect(domainLedger.operationType).toBe(operationType);
      });
    });

    it('should map all OperationStatus enum values', () => {
      const operationStatuses = [
        OperationStatus.HOLD,
        OperationStatus.REFUND,
        OperationStatus.COMPLETED,
        OperationStatus.FAILED,
        OperationStatus.PENDING,
      ];

      operationStatuses.forEach((operationStatus) => {
        const prismaLedger = createMockPrismaBalanceLedger({
          operationStatus,
        });
        const domainLedger = BalanceLedgerPrismaMapper.toDomain(
          prismaLedger as FiatBalanceLedger,
          CurrencyType.FIAT,
        );

        expect(domainLedger.operationStatus).toBe(operationStatus);
      });
    });

    it('should map all LedgerReason enum values', () => {
      const reasons = [
        LedgerReason.PAYMENTS_DEPOSIT,
        LedgerReason.PAYMENTS_WITHDRAWAL,
        LedgerReason.PAYMENTS_REFUND,
        LedgerReason.ADMIN_CORRECTION,
        LedgerReason.GAMES_BET,
        LedgerReason.GAMES_WIN,
        LedgerReason.GAMES_REFUND,
      ];

      reasons.forEach((reason) => {
        const prismaLedger = createMockPrismaBalanceLedger({
          reason,
        });
        const domainLedger = BalanceLedgerPrismaMapper.toDomain(
          prismaLedger as FiatBalanceLedger,
          CurrencyType.FIAT,
        );

        expect(domainLedger.reason).toBe(reason);
      });
    });

    it('should handle zero amount', () => {
      const prismaLedger = createMockPrismaBalanceLedger({
        amount: BigInt(0),
      });
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as FiatBalanceLedger,
        CurrencyType.FIAT,
      );

      expect(domainLedger.amount.toUnitString()).toBe('0');
      expect(domainLedger.amount.isZero()).toBe(true);
    });

    it('should handle large amount values', () => {
      const prismaLedger = createMockPrismaBalanceLedger({
        amount: BigInt('999999999999999999'),
      });
      const domainLedger = BalanceLedgerPrismaMapper.toDomain(
        prismaLedger as FiatBalanceLedger,
        CurrencyType.FIAT,
      );

      expect(domainLedger.amount.toUnitString()).toBe('999999999999999999');
    });
  });

  describe('toPrisma', () => {
    it('should map domain balance ledger to Prisma input with all fields for FIAT', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.FIAT,
      );

      expect(prismaInput.userId).toEqual(BigInt(1));
      expect(prismaInput.operationId).toBe('op-123');
      expect(prismaInput.currencyType).toBe(CurrencyType.FIAT);
      expect(prismaInput.amount).toEqual(BigInt(100000));
      expect(prismaInput.operationType).toBe(OperationType.ADD);
      expect(prismaInput.operationStatus).toBe(OperationStatus.COMPLETED);
      expect(prismaInput.reason).toBe(LedgerReason.PAYMENTS_DEPOSIT);
    });

    it('should map domain balance ledger for BONUS currency type', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-456',
        currencyType: CurrencyType.BONUS,
        amount: BalanceAmount.fromUnit(50000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.GAMES_WIN,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.BONUS,
      );

      expect(prismaInput.currencyType).toBe(CurrencyType.BONUS);
      expect(prismaInput.amount).toEqual(BigInt(50000));
    });

    it('should map domain balance ledger for CRYPTO currency type', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-789',
        currencyType: CurrencyType.CRYPTO,
        amount: BalanceAmount.fromUnit(200000),
        operationType: OperationType.SUBTRACT,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_WITHDRAWAL,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.CRYPTO,
      );

      expect(prismaInput.currencyType).toBe(CurrencyType.CRYPTO);
      expect(prismaInput.amount).toEqual(BigInt(200000));
    });

    it('should convert BalanceAmount to BigInt correctly', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(750000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.FIAT,
      );

      expect(prismaInput.amount).toEqual(BigInt(750000));
    });

    it('should include id when provided', () => {
      const createLedgerEntry = {
        id: 'custom-ledger-id',
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.FIAT,
      );

      expect(prismaInput.id).toBe('custom-ledger-id');
    });

    it('should exclude id when not provided', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.FIAT,
      );

      expect(prismaInput.id).toBeUndefined();
    });

    it('should handle zero amount', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT,
        amount: BalanceAmount.fromUnit(0),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.FIAT,
      );

      expect(prismaInput.amount).toEqual(BigInt(0));
    });

    it('should use currency type parameter instead of data currency type', () => {
      const createLedgerEntry = {
        userId: new BigNumber(1),
        operationId: 'op-123',
        currencyType: CurrencyType.FIAT, // This should be ignored
        amount: BalanceAmount.fromUnit(100000),
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.PAYMENTS_DEPOSIT,
      };

      // Pass BONUS as currency type parameter
      const prismaInput = BalanceLedgerPrismaMapper.toPrisma(
        createLedgerEntry,
        CurrencyType.BONUS,
      );

      // Should use the parameter, not the data property
      expect(prismaInput.currencyType).toBe(CurrencyType.BONUS);
    });
  });
});
