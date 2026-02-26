import BigNumber from 'bignumber.js';
import { BalanceLedgerEntry } from './balance-ledger-entry';
import { BalanceFixtures } from '@app/auth-service/__fixtures__/balance.fixtures';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';

describe('BalanceLedgerEntry Entity', () => {
  describe('Creation', () => {
    it('should create ledger entry with valid data', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry();
      expect(entry.id).toBe('ledger-entry-1');
      expect(entry.userId).toEqual(new BigNumber(1));
      expect(entry.operationId).toBe('op-123');
      expect(entry.currencyType).toBe(CurrencyType.FIAT);
      expect(entry.operationType).toBe(OperationType.ADD);
      expect(entry.operationStatus).toBe(OperationStatus.COMPLETED);
      expect(entry.reason).toBe(LedgerReason.PAYMENTS_DEPOSIT);
      expect(entry.createdAt).toBeInstanceOf(Date);
    });

    it('should create ledger entry with different currency types', () => {
      const fiatEntry = BalanceFixtures.createBalanceLedgerEntry({
        currencyType: CurrencyType.FIAT,
      });
      expect(fiatEntry.currencyType).toBe(CurrencyType.FIAT);

      const bonusEntry = BalanceFixtures.createBalanceLedgerEntry({
        currencyType: CurrencyType.BONUS,
      });
      expect(bonusEntry.currencyType).toBe(CurrencyType.BONUS);

      const cryptoEntry = BalanceFixtures.createBalanceLedgerEntry({
        currencyType: CurrencyType.CRYPTO,
      });
      expect(cryptoEntry.currencyType).toBe(CurrencyType.CRYPTO);
    });

    it('should create ledger entry with different operation types', () => {
      const addEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationType: OperationType.ADD,
      });
      expect(addEntry.operationType).toBe(OperationType.ADD);

      const subtractEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationType: OperationType.SUBTRACT,
      });
      expect(subtractEntry.operationType).toBe(OperationType.SUBTRACT);
    });

    it('should create ledger entry with different operation statuses', () => {
      const completedEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.COMPLETED,
      });
      expect(completedEntry.operationStatus).toBe(OperationStatus.COMPLETED);

      const pendingEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.PENDING,
      });
      expect(pendingEntry.operationStatus).toBe(OperationStatus.PENDING);

      const holdEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.HOLD,
      });
      expect(holdEntry.operationStatus).toBe(OperationStatus.HOLD);

      const failedEntry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.FAILED,
      });
      expect(failedEntry.operationStatus).toBe(OperationStatus.FAILED);
    });
  });

  describe('Domain Methods - Operation Status', () => {
    it('should check if entry is completed', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.COMPLETED,
      });
      expect(entry.isCompleted()).toBe(true);
      expect(entry.isPending()).toBe(false);
      expect(entry.isHold()).toBe(false);
      expect(entry.isFailed()).toBe(false);
    });

    it('should check if entry is pending', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.PENDING,
      });
      expect(entry.isPending()).toBe(true);
      expect(entry.isCompleted()).toBe(false);
      expect(entry.isHold()).toBe(false);
      expect(entry.isFailed()).toBe(false);
    });

    it('should check if entry is hold', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.HOLD,
      });
      expect(entry.isHold()).toBe(true);
      expect(entry.isCompleted()).toBe(false);
      expect(entry.isPending()).toBe(false);
      expect(entry.isFailed()).toBe(false);
    });

    it('should check if entry is failed', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationStatus: OperationStatus.FAILED,
      });
      expect(entry.isFailed()).toBe(true);
      expect(entry.isCompleted()).toBe(false);
      expect(entry.isPending()).toBe(false);
      expect(entry.isHold()).toBe(false);
    });
  });

  describe('Domain Methods - Operation Type', () => {
    it('should check if entry is add operation', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationType: OperationType.ADD,
      });
      expect(entry.isAddOperation()).toBe(true);
      expect(entry.isSubtractOperation()).toBe(false);
    });

    it('should check if entry is subtract operation', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        operationType: OperationType.SUBTRACT,
      });
      expect(entry.isSubtractOperation()).toBe(true);
      expect(entry.isAddOperation()).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return all ledger entry properties correctly', () => {
      const entry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'entry-999',
        userId: new BigNumber(888),
        operationId: 'op-777',
        currencyType: CurrencyType.BONUS,
        amount: BalanceAmount.fromUnit(5000),
        operationType: OperationType.SUBTRACT,
        operationStatus: OperationStatus.PENDING,
        reason: LedgerReason.GAMES_BET,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      });

      expect(entry.id).toBe('entry-999');
      expect(entry.userId).toEqual(new BigNumber(888));
      expect(entry.operationId).toBe('op-777');
      expect(entry.currencyType).toBe(CurrencyType.BONUS);
      expect(entry.amount.toUnitNumber()).toBe(5000);
      expect(entry.operationType).toBe(OperationType.SUBTRACT);
      expect(entry.operationStatus).toBe(OperationStatus.PENDING);
      expect(entry.reason).toBe(LedgerReason.GAMES_BET);
      expect(entry.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
    });
  });
});
