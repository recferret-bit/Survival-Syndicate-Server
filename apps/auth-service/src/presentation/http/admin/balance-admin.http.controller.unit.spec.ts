import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { BalanceAdminHttpController } from './balance-admin.http.controller';
import { RecalculateBalanceCommand } from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.command';
import { IncreaseFiatBalanceCommand } from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.command';
import { IncreaseFiatBalanceHttpDto } from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.dto';
import { RecalculateBalanceHttpDto } from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.dto';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { AdminApiKeyGuard } from '@lib/shared/admin/guards/admin-api-key.guard';
import { Reflector } from '@nestjs/core';

type AdminRequest = Request & { admin?: { id: string; email: string } };

describe('BalanceAdminHttpController (Unit)', () => {
  let controller: BalanceAdminHttpController;
  let commandBus: jest.Mocked<Pick<CommandBus, 'execute'>>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as jest.Mocked<Pick<CommandBus, 'execute'>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceAdminHttpController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
      ],
    })
      .overrideGuard(AdminApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<BalanceAdminHttpController>(
      BalanceAdminHttpController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('increaseFiatBalance', () => {
    it('should call commandBus.execute with IncreaseFiatBalanceCommand', async () => {
      const dto: IncreaseFiatBalanceHttpDto = {
        userId: '12345',
        amount: '10000',
      };
      const req = {
        admin: { id: 'admin-1', email: 'admin@test.com' },
      } as AdminRequest;
      const expectedResponse = {
        success: true,
        ledgerEntryId: 'ledger-uuid',
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.increaseFiatBalance(dto, req);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(IncreaseFiatBalanceCommand),
      );
      const command = commandBus.execute.mock
        .calls[0][0] as IncreaseFiatBalanceCommand;
      expect(command.request.userId).toBe('12345');
      expect(command.request.amount).toBe('10000');
      expect(command.adminId).toBe('admin-1');
      expect(result).toEqual({
        statusCode: 200,
        data: expectedResponse,
      });
    });
  });

  describe('recalculateBalance', () => {
    it('should call commandBus.execute with RecalculateBalanceCommand', async () => {
      const dto: RecalculateBalanceHttpDto = {
        userId: '12345',
        currencyType: CurrencyType.FIAT,
      };
      const expectedResponse = {
        success: true,
        recalculatedAt: new Date(),
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.recalculateBalance(dto);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RecalculateBalanceCommand),
      );
      expect(result).toEqual({
        statusCode: 200,
        data: expectedResponse,
      });
    });
  });
});
