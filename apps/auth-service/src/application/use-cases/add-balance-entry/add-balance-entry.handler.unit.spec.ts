import BigNumber from 'bignumber.js';
import { Test, TestingModule } from '@nestjs/testing';
import { AddBalanceEntryHandler } from './add-balance-entry.handler';
import { AddBalanceEntryCommand } from './add-balance-entry.command';
import { BalanceLedgerPortRepository } from '@app/auth-service/application/ports/balance-ledger.port.repository';
import { BalanceResultPortRepository } from '@app/auth-service/application/ports/balance-result.port.repository';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { BalanceLockService } from '@app/auth-service/infrastructure/services/balance-lock.service';
import { BalanceFixtures } from '@app/auth-service/__fixtures__/balance.fixtures';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';

describe('AddBalanceEntryHandler', () => {
  let handler: AddBalanceEntryHandler;
  let ledgerRepository: jest.Mocked<BalanceLedgerPortRepository>;
  let balanceResultRepository: jest.Mocked<BalanceResultPortRepository>;
  let userBalanceRepository: jest.Mocked<UserBalancePortRepository>;
  let lockService: jest.Mocked<BalanceLockService>;

  beforeEach(async () => {
    ledgerRepository = {
      create: jest.fn(),
      findByOperationId: jest.fn(),
      findByUserId: jest.fn(),
      findAfterLedgerId: jest.fn(),
      countByUserId: jest.fn(),
    } as any;

    balanceResultRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    } as any;

    userBalanceRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
    } as any;

    lockService = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
      isLocked: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddBalanceEntryHandler,
        {
          provide: BalanceLedgerPortRepository,
          useValue: ledgerRepository,
        },
        {
          provide: BalanceResultPortRepository,
          useValue: balanceResultRepository,
        },
        {
          provide: UserBalancePortRepository,
          useValue: userBalanceRepository,
        },
        {
          provide: BalanceLockService,
          useValue: lockService,
        },
      ],
    }).compile();

    handler = module.get<AddBalanceEntryHandler>(AddBalanceEntryHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createRequest = () => ({
      userId: '1',
      operationId: 'op-123',
      currencyType: CurrencyType.FIAT,
      amount: '100000',
      operationType: OperationType.ADD,
      operationStatus: OperationStatus.COMPLETED,
      reason: LedgerReason.PAYMENTS_DEPOSIT,
    });

    it('should create ledger entry successfully when lock is acquired', async () => {
      const request = createRequest();
      const userIdBigNumber = new BigNumber(request.userId);
      const mockLedgerEntry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'ledger-entry-123',
        userId: userIdBigNumber,
        operationId: request.operationId,
      });

      lockService.acquireLock.mockResolvedValue(true);
      ledgerRepository.findByOperationId.mockResolvedValue(null);
      ledgerRepository.create.mockResolvedValue(mockLedgerEntry);

      const result = await handler.execute(new AddBalanceEntryCommand(request));

      expect(result).toEqual({
        success: true,
        ledgerEntryId: 'ledger-entry-123',
      });
      expect(lockService.acquireLock).toHaveBeenCalledWith(
        userIdBigNumber,
        request.operationId,
      );
      expect(ledgerRepository.create).toHaveBeenCalled();
      expect(lockService.releaseLock).toHaveBeenCalledWith(
        userIdBigNumber,
        request.operationId,
      );
    });

    it('should return existing entry when found before lock acquisition', async () => {
      const request = createRequest();
      const userIdBigNumber = new BigNumber(request.userId);
      const existingEntry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'existing-entry',
        userId: userIdBigNumber,
        operationId: request.operationId,
      });

      lockService.acquireLock.mockResolvedValue(false);
      ledgerRepository.findByOperationId.mockResolvedValue(existingEntry);

      const result = await handler.execute(new AddBalanceEntryCommand(request));

      expect(result).toEqual({
        success: true,
        ledgerEntryId: 'existing-entry',
      });
      expect(ledgerRepository.create).not.toHaveBeenCalled();
      expect(lockService.releaseLock).not.toHaveBeenCalled();
    });

    it('should return existing entry after retry when lock exists but no entry initially', async () => {
      const request = createRequest();
      const userIdBigNumber = new BigNumber(request.userId);
      const existingEntry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'retry-entry',
        userId: userIdBigNumber,
        operationId: request.operationId,
      });

      lockService.acquireLock.mockResolvedValue(false);
      ledgerRepository.findByOperationId
        .mockResolvedValueOnce(null) // First check
        .mockResolvedValueOnce(existingEntry); // Retry check

      // Mock setTimeout to avoid actual delay in tests
      jest.useFakeTimers();
      const resultPromise = handler.execute(
        new AddBalanceEntryCommand(request),
      );
      jest.advanceTimersByTime(100);
      jest.useRealTimers();

      const result = await resultPromise;

      expect(result).toEqual({
        success: true,
        ledgerEntryId: 'retry-entry',
      });
      expect(ledgerRepository.findByOperationId).toHaveBeenCalledTimes(2);
      expect(ledgerRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when lock exists but no entry found after retry', async () => {
      const request = createRequest();

      lockService.acquireLock.mockResolvedValue(false);
      ledgerRepository.findByOperationId
        .mockResolvedValueOnce(null) // First check
        .mockResolvedValueOnce(null); // Retry check

      jest.useFakeTimers();
      const resultPromise = handler.execute(
        new AddBalanceEntryCommand(request),
      );
      jest.advanceTimersByTime(100);
      jest.useRealTimers();

      await expect(resultPromise).rejects.toThrow(
        'Failed to acquire lock and no existing entry found',
      );
    });

    it('should return existing entry when found after lock acquisition', async () => {
      const request = createRequest();
      const userIdBigNumber = new BigNumber(request.userId);
      const existingEntry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'existing-after-lock',
        userId: userIdBigNumber,
        operationId: request.operationId,
      });

      lockService.acquireLock.mockResolvedValue(true);
      ledgerRepository.findByOperationId.mockResolvedValue(existingEntry);

      const result = await handler.execute(new AddBalanceEntryCommand(request));

      expect(result).toEqual({
        success: true,
        ledgerEntryId: 'existing-after-lock',
      });
      expect(ledgerRepository.create).not.toHaveBeenCalled();
      expect(lockService.releaseLock).toHaveBeenCalled();
    });

    it('should handle unique constraint violation (P2002) and return existing entry', async () => {
      const request = createRequest();
      const userIdBigNumber = new BigNumber(request.userId);
      const existingEntry = BalanceFixtures.createBalanceLedgerEntry({
        id: 'existing-from-constraint',
        userId: userIdBigNumber,
        operationId: request.operationId,
      });

      lockService.acquireLock.mockResolvedValue(true);
      ledgerRepository.findByOperationId
        .mockResolvedValueOnce(null) // Before create
        .mockResolvedValueOnce(existingEntry); // After constraint violation
      ledgerRepository.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint violation',
      });

      const result = await handler.execute(new AddBalanceEntryCommand(request));

      expect(result).toEqual({
        success: true,
        ledgerEntryId: 'existing-from-constraint',
      });
      expect(lockService.releaseLock).toHaveBeenCalled();
    });

    it('should throw error when unique constraint violation but no entry found', async () => {
      const request = createRequest();

      lockService.acquireLock.mockResolvedValue(true);
      ledgerRepository.findByOperationId.mockResolvedValue(null);
      ledgerRepository.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint violation',
      });

      await expect(
        handler.execute(new AddBalanceEntryCommand(request)),
      ).rejects.toMatchObject({
        code: 'P2002',
      });
      expect(lockService.releaseLock).toHaveBeenCalled();
    });

    it('should always release lock in finally block even on error', async () => {
      const request = createRequest();

      lockService.acquireLock.mockResolvedValue(true);
      ledgerRepository.findByOperationId.mockResolvedValue(null);
      ledgerRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        handler.execute(new AddBalanceEntryCommand(request)),
      ).rejects.toThrow('Database error');

      const userIdBigNumber = new BigNumber(request.userId);
      expect(lockService.releaseLock).toHaveBeenCalledWith(
        userIdBigNumber,
        request.operationId,
      );
    });

    it('should work with different currency types', async () => {
      const currencyTypes = [
        CurrencyType.FIAT,
        CurrencyType.BONUS,
        CurrencyType.CRYPTO,
      ];

      for (const currencyType of currencyTypes) {
        const request = {
          ...createRequest(),
          currencyType,
        };
        const mockLedgerEntry = BalanceFixtures.createBalanceLedgerEntry({
          id: `ledger-${currencyType}`,
          currencyType,
        });

        lockService.acquireLock.mockResolvedValue(true);
        ledgerRepository.findByOperationId.mockResolvedValue(null);
        ledgerRepository.create.mockResolvedValue(mockLedgerEntry);

        const result = await handler.execute(
          new AddBalanceEntryCommand(request),
        );

        expect(result.success).toBe(true);
        expect(ledgerRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            currencyType,
          }),
          currencyType,
        );
      }
    });
  });
});
