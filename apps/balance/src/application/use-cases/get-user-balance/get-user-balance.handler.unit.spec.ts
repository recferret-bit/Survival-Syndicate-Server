import BigNumber from 'bignumber.js';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserBalanceHandler } from './get-user-balance.handler';
import { GetUserBalanceQuery } from './get-user-balance.query';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceFixtures } from '@app/balance/__fixtures__/balance.fixtures';
import { CurrencyCode } from '@lib/shared/currency';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';

describe('GetUserBalanceHandler', () => {
  let handler: GetUserBalanceHandler;
  let userBalanceRepository: jest.Mocked<UserBalancePortRepository>;

  beforeEach(async () => {
    userBalanceRepository = {
      findByUserId: jest.fn(),
      exists: jest.fn(),
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserBalanceHandler,
        {
          provide: UserBalancePortRepository,
          useValue: userBalanceRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserBalanceHandler>(GetUserBalanceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should get user balance successfully', async () => {
      const userId = '1';
      const userIdBigNumber = new BigNumber(userId);
      const userBalance = BalanceFixtures.createUserBalance({
        userId: userIdBigNumber,
      });

      userBalanceRepository.findByUserId.mockResolvedValue(userBalance);

      const result = await handler.execute(new GetUserBalanceQuery({ userId }));

      expect(result).toHaveProperty('balances');
      // Should include FIAT and BONUS, and CRYPTO if it exists
      expect(result.balances.length).toBeGreaterThanOrEqual(2);
      expect(result.balances[0]).toHaveProperty('currencyType', 'fiat');
      expect(result.balances[1]).toHaveProperty('currencyType', 'bonus');
      if (userBalance.hasCryptoBalance()) {
        expect(result.balances.length).toBe(3);
        expect(result.balances[2]).toHaveProperty('currencyType', 'crypto');
      }
      expect(userBalanceRepository.findByUserId).toHaveBeenCalledWith(
        userIdBigNumber,
      );
    });

    it('should include crypto balance if exists', async () => {
      const userId = '1';
      const userIdBigNumber = new BigNumber(userId);
      const userBalance = BalanceFixtures.createUserBalance({
        userId: userIdBigNumber,
      });

      userBalanceRepository.findByUserId.mockResolvedValue(userBalance);

      const result = await handler.execute(new GetUserBalanceQuery({ userId }));

      // Should include crypto balance if it exists
      if (userBalance.hasCryptoBalance()) {
        expect(result.balances.length).toBeGreaterThanOrEqual(3);
        const cryptoBalance = result.balances.find(
          (b) => b.currencyType === 'crypto',
        );
        expect(cryptoBalance).toBeDefined();
      }
    });

    it('should throw NotFoundException if balance not found', async () => {
      const userId = '999';
      const userIdBigNumber = new BigNumber(userId);

      userBalanceRepository.findByUserId.mockResolvedValue(null);

      await expect(
        handler.execute(new GetUserBalanceQuery({ userId })),
      ).rejects.toThrow(NotFoundException);

      expect(userBalanceRepository.findByUserId).toHaveBeenCalledWith(
        userIdBigNumber,
      );
    });

    it('should return correct balance amounts', async () => {
      const userId = '1';
      const userIdBigNumber = new BigNumber(userId);
      const userBalance = BalanceFixtures.createUserBalanceWithAmount(
        userIdBigNumber,
        10000,
        CurrencyCode.USD,
      );

      userBalanceRepository.findByUserId.mockResolvedValue(userBalance);

      const result = await handler.execute(new GetUserBalanceQuery({ userId }));

      const fiatBalance = result.balances.find(
        (b) => b.currencyType === CurrencyType.FIAT,
      );
      expect(fiatBalance).toBeDefined();
      expect(fiatBalance!.balance).toBe('10000');
      expect(fiatBalance!.balanceDecimal).toBe(100.0); // 10000 cents = 100.00 USD
    });
  });
});
