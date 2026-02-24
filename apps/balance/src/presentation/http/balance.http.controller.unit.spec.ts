import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { BalanceHttpController } from './balance.http.controller';
import { GetUserBalanceQuery } from '@app/balance/application/use-cases/get-user-balance/get-user-balance.query';
import { BalanceFixtures } from '@app/balance/__fixtures__/balance.fixtures';
import { UserSession, AuthJwtGuard } from '@lib/shared/auth';
import type { Request } from 'express';

interface RequestWithSession extends Request {
  session?: UserSession;
}

describe('BalanceHttpController (Unit)', () => {
  let controller: BalanceHttpController;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    queryBus = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceHttpController],
      providers: [
        {
          provide: QueryBus,
          useValue: queryBus,
        },
      ],
    })
      .overrideGuard(AuthJwtGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<BalanceHttpController>(BalanceHttpController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should call queryBus.execute with GetUserBalanceQuery', async () => {
      const userId = 1;
      const mockRequest = {
        session: {
          id: userId,
          email: 'test@example.com',
          phone: '+1234567890',
          currencyCode: 'USD',
          geo: 'USA',
          createdAt: Date.now(),
          isTestUser: false,
        },
      } as unknown as RequestWithSession;

      const expectedResponse = {
        balances: [
          {
            currencyType: 'fiat',
            currencyIsoCode: 'USD',
            amount: '100.00',
            availableAmount: '100.00',
          },
          {
            currencyType: 'bonus',
            currencyIsoCode: 'USD',
            amount: '50.00',
            availableAmount: '50.00',
          },
        ],
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getBalance(mockRequest);

      const callArgs = (queryBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(GetUserBalanceQuery);
      expect(callArgs.request.userId).toBe(userId.toString());
      expect(queryBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should extract userId from session', async () => {
      const userId = 42;
      const mockRequest = {
        session: {
          id: userId,
          email: 'test@example.com',
          phone: '+1234567890',
          currencyCode: 'USD',
          geo: 'USA',
          createdAt: Date.now(),
          isTestUser: false,
        },
      } as unknown as RequestWithSession;

      queryBus.execute.mockResolvedValue({
        balances: [],
      });

      await controller.getBalance(mockRequest);

      const callArgs = (queryBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(GetUserBalanceQuery);
      expect(callArgs.request.userId).toBe(userId.toString());
    });

    it('should handle different user IDs', async () => {
      const userId = 999;
      const mockRequest = {
        session: {
          id: userId,
          email: 'another@example.com',
          phone: '+9876543210',
          currencyCode: 'EUR',
          geo: 'DE',
          createdAt: Date.now(),
          isTestUser: false,
        },
      } as unknown as RequestWithSession;

      const mockResponse = {
        balances: [
          {
            currencyType: 'fiat',
            currencyIsoCode: 'EUR',
            amount: '200.00',
            availableAmount: '200.00',
          },
        ],
      };

      queryBus.execute.mockResolvedValue(mockResponse);

      const result = await controller.getBalance(mockRequest);

      const callArgs = (queryBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(GetUserBalanceQuery);
      expect(callArgs.request.userId).toBe(userId.toString());
      expect(result).toEqual(mockResponse);
    });
  });
});
