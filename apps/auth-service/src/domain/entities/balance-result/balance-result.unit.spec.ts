import BigNumber from 'bignumber.js';
import { BalanceResult } from './balance-result';
import { BalanceFixtures } from '@app/auth-service/__fixtures__/balance.fixtures';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';

describe('BalanceResult Entity', () => {
  describe('Creation', () => {
    it('should create balance result with valid data', () => {
      const balanceResult = BalanceFixtures.createBalanceResult();
      expect(balanceResult.id).toBe('balance-result-1');
      expect(balanceResult.userId).toEqual(new BigNumber(1));
      expect(balanceResult.currencyIsoCode).toBe('USD');
      expect(balanceResult.balance).toBeInstanceOf(BalanceAmount);
      expect(balanceResult.lastCalculatedAt).toBeInstanceOf(Date);
    });

    it('should create balance result with custom values', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        id: 'custom-id',
        userId: new BigNumber(999),
        currencyIsoCode: 'EUR',
        balance: BalanceAmount.fromUnit(5000),
        lastLedgerId: 'ledger-123',
      });

      expect(balanceResult.id).toBe('custom-id');
      expect(balanceResult.userId).toEqual(new BigNumber(999));
      expect(balanceResult.currencyIsoCode).toBe('EUR');
      expect(balanceResult.balance.toUnitNumber()).toBe(5000);
      expect(balanceResult.lastLedgerId).toBe('ledger-123');
    });
  });

  describe('Domain Methods', () => {
    it('should check if balance has balance (non-zero)', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        balance: BalanceAmount.fromUnit(1000),
      });
      expect(balanceResult.hasBalance()).toBe(true);
    });

    it('should check if balance has no balance (zero)', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        balance: BalanceAmount.fromUnit(0),
      });
      expect(balanceResult.hasBalance()).toBe(false);
    });

    it('should check if balance is negative', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        balance: BalanceAmount.fromUnit(-100),
      });
      expect(balanceResult.isNegative()).toBe(true);
    });

    it('should check if balance is not negative', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        balance: BalanceAmount.fromUnit(100),
      });
      expect(balanceResult.isNegative()).toBe(false);
    });

    it('should check if zero balance is not negative', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        balance: BalanceAmount.fromUnit(0),
      });
      expect(balanceResult.isNegative()).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return all balance result properties correctly', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        id: 'result-123',
        userId: new BigNumber(456),
        balance: BalanceAmount.fromUnit(10000),
        currencyIsoCode: 'GBP',
        lastCalculatedAt: new Date('2024-01-01T00:00:00Z'),
        lastLedgerId: 'ledger-456',
      });

      expect(balanceResult.id).toBe('result-123');
      expect(balanceResult.userId).toEqual(new BigNumber(456));
      expect(balanceResult.balance.toUnitNumber()).toBe(10000);
      expect(balanceResult.currencyIsoCode).toBe('GBP');
      expect(balanceResult.lastCalculatedAt).toEqual(
        new Date('2024-01-01T00:00:00Z'),
      );
      expect(balanceResult.lastLedgerId).toBe('ledger-456');
    });

    it('should return undefined for lastLedgerId when not provided', () => {
      const balanceResult = BalanceFixtures.createBalanceResult({
        lastLedgerId: undefined,
      });
      expect(balanceResult.lastLedgerId).toBeUndefined();
    });
  });
});
