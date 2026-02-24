import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { CreateUserBalanceHandler } from './create-user-balance.handler';
import { CreateUserBalanceCommand } from './create-user-balance.command';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { BalanceFixtures } from '@app/balance/__fixtures__/balance.fixtures';
import { BalanceResult } from '@app/balance/domain/entities/balance-result/balance-result';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';

describe('CreateUserBalanceHandler', () => {
  let handler: CreateUserBalanceHandler;
  let userBalanceRepository: jest.Mocked<UserBalancePortRepository>;
  let balanceResultRepository: jest.Mocked<BalanceResultPortRepository>;

  beforeEach(async () => {
    userBalanceRepository = {
      exists: jest.fn(),
      create: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    balanceResultRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserBalanceHandler,
        {
          provide: UserBalancePortRepository,
          useValue: userBalanceRepository,
        },
        {
          provide: BalanceResultPortRepository,
          useValue: balanceResultRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateUserBalanceHandler>(CreateUserBalanceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create user balance successfully', async () => {
      const request = BalanceFixtures.createCreateUserBalanceRequest();
      const fiatBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });
      const bonusBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });
      const cryptoBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });

      userBalanceRepository.exists.mockResolvedValue(false);
      balanceResultRepository.create
        .mockResolvedValueOnce(fiatBalance)
        .mockResolvedValueOnce(bonusBalance)
        .mockResolvedValueOnce(cryptoBalance);
      userBalanceRepository.create.mockResolvedValue(
        BalanceFixtures.createUserBalance({
          userId: new BigNumber(request.userId),
          fiatBalance,
          bonusBalance,
          cryptoBalance,
        }),
      );

      const result = await handler.execute(
        new CreateUserBalanceCommand(request),
      );

      expect(result).toEqual({
        success: true,
        userId: request.userId,
      });
      expect(userBalanceRepository.exists).toHaveBeenCalledWith(
        new BigNumber(request.userId),
      );
      expect(balanceResultRepository.create).toHaveBeenCalledTimes(3);
      expect(userBalanceRepository.create).toHaveBeenCalled();
    });

    it('should reject creation if user balance already exists', async () => {
      const request = BalanceFixtures.createCreateUserBalanceRequest();

      userBalanceRepository.exists.mockResolvedValue(true);

      await expect(
        handler.execute(new CreateUserBalanceCommand(request)),
      ).rejects.toThrow(ConflictException);

      expect(balanceResultRepository.create).not.toHaveBeenCalled();
      expect(userBalanceRepository.create).not.toHaveBeenCalled();
    });

    it('should create balance results with zero balance', async () => {
      const request = BalanceFixtures.createCreateUserBalanceRequest();
      const fiatBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });
      const bonusBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });
      const cryptoBalance = BalanceFixtures.createBalanceResult({
        currencyIsoCode: 'USD',
      });

      userBalanceRepository.exists.mockResolvedValue(false);
      balanceResultRepository.create
        .mockResolvedValueOnce(fiatBalance)
        .mockResolvedValueOnce(bonusBalance)
        .mockResolvedValueOnce(cryptoBalance);
      userBalanceRepository.create.mockResolvedValue(
        BalanceFixtures.createUserBalance(),
      );

      await handler.execute(new CreateUserBalanceCommand(request));

      // Verify all balance results are created with zero balance
      expect(balanceResultRepository.create).toHaveBeenCalledTimes(3);
      const fiatCall = balanceResultRepository.create.mock.calls[0];
      expect(fiatCall[0].balance.toUnitString()).toBe('0');
      expect(fiatCall[1]).toBe(CurrencyType.FIAT);
    });
  });
});
