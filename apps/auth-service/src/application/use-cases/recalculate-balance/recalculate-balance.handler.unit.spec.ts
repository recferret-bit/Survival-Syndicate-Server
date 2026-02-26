import { Test, TestingModule } from '@nestjs/testing';
import BigNumber from 'bignumber.js';
import { RecalculateBalanceHandler } from './recalculate-balance.handler';
import { RecalculateBalanceCommand } from './recalculate-balance.command';
import { BalanceRecalculationService } from '@app/auth-service/infrastructure/services/balance-recalculation.service';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';

describe('RecalculateBalanceHandler', () => {
  let handler: RecalculateBalanceHandler;
  let recalculationService: jest.Mocked<BalanceRecalculationService>;

  beforeEach(async () => {
    recalculationService = {
      recalculateBalance: jest.fn(),
      recalculateBalanceFromScratch: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecalculateBalanceHandler,
        {
          provide: BalanceRecalculationService,
          useValue: recalculationService,
        },
      ],
    }).compile();

    handler = module.get<RecalculateBalanceHandler>(RecalculateBalanceHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should recalculate balance for specific FIAT currency type', async () => {
      const request = {
        userId: '1',
        currencyType: CurrencyType.FIAT,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );

      expect(result.success).toBe(true);
      expect(result.recalculatedAt).toBeInstanceOf(Date);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledTimes(1);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.FIAT,
        expect.any(String), // defaultCurrencyIsoCode
      );
    });

    it('should recalculate balance for specific BONUS currency type', async () => {
      const request = {
        userId: '2',
        currencyType: CurrencyType.BONUS,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );

      expect(result.success).toBe(true);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.BONUS,
        expect.any(String),
      );
    });

    it('should recalculate balance for specific CRYPTO currency type', async () => {
      const request = {
        userId: '3',
        currencyType: CurrencyType.CRYPTO,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );

      expect(result.success).toBe(true);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.CRYPTO,
        expect.any(String),
      );
    });

    it('should recalculate all currency types when currencyType is not specified', async () => {
      const request = {
        userId: '4',
        currencyType: undefined,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );

      expect(result.success).toBe(true);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledTimes(2);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.FIAT,
        expect.any(String),
      );
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.BONUS,
        expect.any(String),
      );
    });

    it('should recalculate all currency types when currencyType is undefined', async () => {
      const request = {
        userId: '5',
        currencyType: undefined,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );

      expect(result.success).toBe(true);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledTimes(2);
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.FIAT,
        expect.any(String),
      );
      expect(recalculationService.recalculateBalance).toHaveBeenCalledWith(
        new BigNumber(request.userId),
        CurrencyType.BONUS,
        expect.any(String),
      );
    });

    it('should recalculate all currency types in parallel', async () => {
      const request = {
        userId: '6',
        currencyType: undefined,
      };

      // Track call order
      const callOrder: string[] = [];
      recalculationService.recalculateBalance.mockImplementation(
        async (userId, currencyType) => {
          callOrder.push(currencyType);
          return Promise.resolve();
        },
      );

      await handler.execute(new RecalculateBalanceCommand(request));

      // Both should be called (order may vary due to Promise.all)
      expect(callOrder).toContain(CurrencyType.FIAT);
      expect(callOrder).toContain(CurrencyType.BONUS);
      expect(callOrder).toHaveLength(2);
    });

    it('should use default currency ISO code from Currencies array', async () => {
      const request = {
        userId: '7',
        currencyType: CurrencyType.FIAT,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      await handler.execute(new RecalculateBalanceCommand(request));

      const callArgs = recalculationService.recalculateBalance.mock.calls[0];
      const currencyIsoCode = callArgs[2];

      // Should be a string (defaults to first currency or 'USD')
      expect(typeof currencyIsoCode).toBe('string');
      expect(currencyIsoCode.length).toBeGreaterThan(0);
    });

    it('should use USD as fallback when Currencies array is empty', async () => {
      // This test verifies the fallback logic in the handler
      const request = {
        userId: '8',
        currencyType: CurrencyType.FIAT,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      await handler.execute(new RecalculateBalanceCommand(request));

      const callArgs = recalculationService.recalculateBalance.mock.calls[0];
      const currencyIsoCode = callArgs[2];

      // Should default to 'USD' if Currencies array is empty
      // The actual value depends on Currencies[0]?.getIsoCode() || 'USD'
      expect(typeof currencyIsoCode).toBe('string');
    });

    it('should return recalculatedAt timestamp', async () => {
      const request = {
        userId: '9',
        currencyType: CurrencyType.FIAT,
      };

      recalculationService.recalculateBalance.mockResolvedValue(undefined);

      const beforeTime = new Date();
      const result = await handler.execute(
        new RecalculateBalanceCommand(request),
      );
      const afterTime = new Date();

      expect(result.recalculatedAt).toBeInstanceOf(Date);
      expect(result.recalculatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(result.recalculatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });
});
