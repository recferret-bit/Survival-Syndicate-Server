import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BalanceNatsController } from './balance.nats.controller';
import { BalanceSubjects } from '@lib/lib-building';
import type { CreateUserBalanceRequest } from '@lib/lib-building';
import { CreateUserBalanceCommand } from '@app/auth-service/application/use-cases/create-user-balance/create-user-balance.command';
import { CurrencyCode } from '@lib/shared/currency';

describe('BalanceNatsController (Unit)', () => {
  let controller: BalanceNatsController;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceNatsController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BalanceNatsController>(BalanceNatsController);
    commandBus = module.get<CommandBus>(CommandBus) as jest.Mocked<CommandBus>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCreateUserBalance', () => {
    it('should handle create user balance request', async () => {
      const request: CreateUserBalanceRequest = {
        userId: '1',
        currencyIsoCodes: [CurrencyCode.USD],
      };
      const mockResponse = {
        success: true,
        userId: '1',
      };
      const expectedResponse = {
        success: true,
        userId: '1',
      };

      commandBus.execute.mockResolvedValue(mockResponse);

      const result = await controller.handleCreateUserBalance(request);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateUserBalanceCommand),
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should validate request with Zod schema - invalid userId', async () => {
      const invalidRequest = {
        userId: '-1', // Invalid: must be positive
        currencyIsoCodes: [CurrencyCode.USD],
      };

      await expect(
        controller.handleCreateUserBalance(invalidRequest as any),
      ).rejects.toThrow();
    });

    it('should validate request with Zod schema - empty currency array', async () => {
      const invalidRequest = {
        userId: '1',
        currencyIsoCodes: [], // Invalid: must have at least one
      };

      await expect(
        controller.handleCreateUserBalance(invalidRequest as any),
      ).rejects.toThrow();
    });

    it('should validate request with Zod schema - missing currencyIsoCodes', async () => {
      const invalidRequest = {
        userId: '1',
        // Missing currencyIsoCodes
      };

      await expect(
        controller.handleCreateUserBalance(invalidRequest as any),
      ).rejects.toThrow();
    });

    it('should use correct NATS subject from BalanceSubjects', () => {
      // Verify the subject constant is exported correctly
      expect(BalanceSubjects.CREATE_USER_BALANCE).toBe(
        'balance.create-user-balance.v1',
      );
    });
  });
});
