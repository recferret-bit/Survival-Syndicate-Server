import BigNumber from 'bignumber.js';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserBalanceHandler } from './get-user-balance.handler';
import { GetUserBalanceQuery } from './get-user-balance.query';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { BalanceFixtures } from '@app/auth-service/__fixtures__/balance.fixtures';
import { CurrencyCode } from '@lib/shared/currency';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';

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
      // Current implementation returns FIAT and BONUS balances
      expect(result.balances.length).toBe(2);
      expect(result.balances[0]).toHaveProperty('currencyType', 'fiat');
      expect(result.balances[1]).toHaveProperty('currencyType', 'bonus');
      expect(userBalanceRepository.findByUserId).toHaveBeenCalledWith(
        userIdBigNumber,
      );
    });

    it('should return only fiat and bonus balances', async () => {
      const userId = '1';
      const userIdBigNumber = new BigNumber(userId);
      const userBalance = BalanceFixtures.createUserBalance({
        userId: userIdBigNumber,
      });

      userBalanceRepository.findByUserId.mockResolvedValue(userBalance);

      const result = await handler.execute(new GetUserBalanceQuery({ userId }));

      expect(result.balances).toHaveLength(2);
      expect(result.balances.every((b) => b.currencyType !== 'crypto')).toBe(
        true,
      );
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
      expect(fiatBalance!.balanceDecimals).toBe(2);
    });
  });
});
