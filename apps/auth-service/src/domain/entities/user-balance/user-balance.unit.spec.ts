import BigNumber from 'bignumber.js';
import { UserBalance } from './user-balance';
import { BalanceFixtures } from '@app/auth-service/__fixtures__/balance.fixtures';

describe('UserBalance Entity', () => {
  describe('Creation', () => {
    it('should create user balance with valid data', () => {
      const userBalance = BalanceFixtures.createUserBalance();
      expect(userBalance.id).toBe('user-balance-1');
      expect(userBalance.userId).toEqual(new BigNumber(1));
      expect(userBalance.fiatBalance).toBeDefined();
      expect(userBalance.bonusBalance).toBeDefined();
      expect(userBalance.cryptoBalance).toBeDefined();
    });

    it('should create user balance without crypto balance', () => {
      const userBalance = BalanceFixtures.createUserBalance({
        cryptoBalance: undefined,
      });
      expect(userBalance.cryptoBalance).toBeUndefined();
    });
  });

  describe('Domain Methods', () => {
    it('should check if user has crypto balance', () => {
      const userBalance = BalanceFixtures.createUserBalance();
      expect(userBalance.hasCryptoBalance()).toBe(true);
    });

    it('should check if user does not have crypto balance', () => {
      const userBalance = BalanceFixtures.createUserBalance({
        cryptoBalance: undefined,
      });
      expect(userBalance.hasCryptoBalance()).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return all user balance properties correctly', () => {
      const userBalance = BalanceFixtures.createUserBalance({
        id: 'test-balance-id',
        userId: new BigNumber(123),
      });

      expect(userBalance.id).toBe('test-balance-id');
      expect(userBalance.userId).toEqual(new BigNumber(123));
      expect(userBalance.fiatBalance).toBeDefined();
      expect(userBalance.bonusBalance).toBeDefined();
      expect(userBalance.cryptoBalance).toBeDefined();
    });

    it('should return fiat balance correctly', () => {
      const userBalance = BalanceFixtures.createUserBalance();
      const fiatBalance = userBalance.fiatBalance;

      expect(fiatBalance).toBeDefined();
      expect(fiatBalance.userId).toEqual(new BigNumber(1));
      expect(fiatBalance.currencyIsoCode).toBe('USD');
    });

    it('should return bonus balance correctly', () => {
      const userBalance = BalanceFixtures.createUserBalance();
      const bonusBalance = userBalance.bonusBalance;

      expect(bonusBalance).toBeDefined();
      expect(bonusBalance.userId).toEqual(new BigNumber(1));
      expect(bonusBalance.currencyIsoCode).toBe('USD');
    });

    it('should return crypto balance correctly when present', () => {
      const userBalance = BalanceFixtures.createUserBalance();
      const cryptoBalance = userBalance.cryptoBalance;

      expect(cryptoBalance).toBeDefined();
      expect(cryptoBalance!.userId).toEqual(new BigNumber(1));
      expect(cryptoBalance!.currencyIsoCode).toBe('USD');
    });
  });
});
