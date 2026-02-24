import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { IncreaseFiatBalanceHandler } from './increase-fiat-balance.handler';
import { IncreaseFiatBalanceCommand } from './increase-fiat-balance.command';
import { AddBalanceEntryCommand } from '@app/balance/application/use-cases/add-balance-entry/add-balance-entry.command';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';

describe('IncreaseFiatBalanceHandler', () => {
  let handler: IncreaseFiatBalanceHandler;
  let commandBus: jest.Mocked<Pick<CommandBus, 'execute'>>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as jest.Mocked<Pick<CommandBus, 'execute'>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncreaseFiatBalanceHandler,
        {
          provide: CommandBus,
          useValue: commandBus,
        },
      ],
    }).compile();

    handler = module.get<IncreaseFiatBalanceHandler>(
      IncreaseFiatBalanceHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should execute AddBalanceEntryCommand with correct params when operationId is provided', async () => {
      const request = {
        userId: '12345',
        amount: '10000',
        operationId: 'admin-increase-custom-id',
      };
      const mockResponse = {
        success: true,
        ledgerEntryId: 'ledger-entry-uuid',
      };

      commandBus.execute.mockResolvedValue(mockResponse);

      const result = await handler.execute(
        new IncreaseFiatBalanceCommand(request, 'admin-1'),
      );

      expect(result).toEqual(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      const addBalanceCommand = commandBus.execute.mock
        .calls[0][0] as AddBalanceEntryCommand;
      expect(addBalanceCommand).toBeInstanceOf(AddBalanceEntryCommand);
      expect(addBalanceCommand.request).toEqual({
        userId: '12345',
        operationId: 'admin-increase-custom-id',
        currencyType: CurrencyType.FIAT,
        amount: '10000',
        operationType: OperationType.ADD,
        operationStatus: OperationStatus.COMPLETED,
        reason: LedgerReason.ADMIN_CORRECTION,
      });
    });

    it('should generate operationId with adminId when operationId is not provided', async () => {
      const request = {
        userId: '67890',
        amount: '5000',
      };
      const mockResponse = {
        success: true,
        ledgerEntryId: 'ledger-entry-uuid',
      };

      commandBus.execute.mockResolvedValue(mockResponse);

      await handler.execute(
        new IncreaseFiatBalanceCommand(request, 'admin-42'),
      );

      const addBalanceCommand = commandBus.execute.mock
        .calls[0][0] as AddBalanceEntryCommand;
      expect(addBalanceCommand.request.operationId).toMatch(
        /^admin-increase-admin-42-[0-9a-f-]{36}$/,
      );
      expect(addBalanceCommand.request.reason).toBe(
        LedgerReason.ADMIN_CORRECTION,
      );
      expect(addBalanceCommand.request.operationType).toBe(OperationType.ADD);
      expect(addBalanceCommand.request.operationStatus).toBe(
        OperationStatus.COMPLETED,
      );
    });

    it('should use ADMIN_CORRECTION as ledger reason for audit trail', async () => {
      const request = {
        userId: '1',
        amount: '100',
        operationId: 'op-123',
      };

      commandBus.execute.mockResolvedValue({
        success: true,
        ledgerEntryId: 'ledger-1',
      });

      await handler.execute(new IncreaseFiatBalanceCommand(request));

      const addBalanceCommand = commandBus.execute.mock
        .calls[0][0] as AddBalanceEntryCommand;
      expect(addBalanceCommand.request.reason).toBe(
        LedgerReason.ADMIN_CORRECTION,
      );
    });

    it('should generate operationId with unknown when adminId is not provided', async () => {
      const request = {
        userId: '1',
        amount: '100',
      };

      commandBus.execute.mockResolvedValue({
        success: true,
        ledgerEntryId: 'ledger-1',
      });

      await handler.execute(new IncreaseFiatBalanceCommand(request));

      const addBalanceCommand = commandBus.execute.mock
        .calls[0][0] as AddBalanceEntryCommand;
      expect(addBalanceCommand.request.operationId).toMatch(
        /^admin-increase-unknown-[0-9a-f-]{36}$/,
      );
    });
  });
});
