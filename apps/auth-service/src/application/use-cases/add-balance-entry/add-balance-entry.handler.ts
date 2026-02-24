import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AddBalanceEntryCommand } from './add-balance-entry.command';
import { AddBalanceEntryResponseDto } from './add-balance-entry.dto';
import { BalanceLedgerPortRepository } from '@app/balance/application/ports/balance-ledger.port.repository';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceLockService } from '@app/balance/infrastructure/services/balance-lock.service';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import { BalanceLedgerEntry } from '@app/balance/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';
import { randomUUID } from 'crypto';
import { stringToBigNumber } from '@lib/shared';
import { CurrencyCode } from '@lib/shared/currency';
import BigNumber from 'bignumber.js';

@CommandHandler(AddBalanceEntryCommand)
export class AddBalanceEntryHandler
  implements ICommandHandler<AddBalanceEntryCommand>
{
  private readonly logger = new Logger(AddBalanceEntryHandler.name);

  constructor(
    private readonly ledgerRepository: BalanceLedgerPortRepository,
    private readonly balanceResultRepository: BalanceResultPortRepository,
    private readonly userBalanceRepository: UserBalancePortRepository,
    private readonly lockService: BalanceLockService,
  ) {}

  async execute(
    command: AddBalanceEntryCommand,
  ): Promise<AddBalanceEntryResponseDto> {
    const {
      userId,
      operationId,
      currencyType,
      amount,
      operationType,
      operationStatus,
      reason,
    } = command.request;
    const userIdBigNumber = stringToBigNumber(userId);

    this.logger.log(
      `Adding balance entry for userId: ${userIdBigNumber.toString()}, operationId: ${operationId}, currencyType: ${currencyType}`,
    );

    // Try to acquire lock with retry logic
    const lockResult = await this.acquireLockWithRetry(
      userIdBigNumber,
      operationId,
      currencyType,
    );

    if (lockResult.existingEntry) {
      return {
        success: true,
        ledgerEntryId: lockResult.existingEntry.id,
      };
    }

    if (!lockResult.lockAcquired) {
      throw new Error(
        `Failed to acquire lock and no existing entry found for userId: ${userIdBigNumber.toString()}, operationId: ${operationId}`,
      );
    }

    try {
      // Double-check if entry exists (race condition protection)
      const existing = await this.checkExistingEntry(
        userIdBigNumber,
        operationId,
        currencyType,
      );

      if (existing) {
        return {
          success: true,
          ledgerEntryId: existing.id,
        };
      }

      // Create ledger entry
      const ledgerEntry = await this.createLedgerEntry(
        userIdBigNumber,
        operationId,
        currencyType,
        amount,
        operationType,
        operationStatus,
        reason,
      );

      // Update balance result if status/type combination requires it
      if (this.shouldUpdateBalance(ledgerEntry)) {
        await this.updateBalanceResult(
          userIdBigNumber,
          currencyType,
          ledgerEntry,
        );
      }

      return {
        success: true,
        ledgerEntryId: ledgerEntry.id,
      };
    } catch (error: unknown) {
      // Handle unique constraint violation (P2002)
      const isP2002 =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: string }).code === 'P2002';
      if (isP2002) {
        this.logger.warn(
          `Unique constraint violation for userId: ${userIdBigNumber.toString()}, operationId: ${operationId}. Fetching existing entry.`,
        );

        const existing = await this.checkExistingEntry(
          userIdBigNumber,
          operationId,
          currencyType,
        );

        if (existing) {
          return {
            success: true,
            ledgerEntryId: existing.id,
          };
        }
      }

      throw error;
    } finally {
      // Always release lock
      await this.lockService.releaseLock(userIdBigNumber, operationId);
    }
  }

  /**
   * Acquire lock with retry logic for existing entries
   */
  private async acquireLockWithRetry(
    userId: BigNumber,
    operationId: string,
    currencyType: CurrencyType,
  ): Promise<{
    lockAcquired: boolean;
    existingEntry: BalanceLedgerEntry | null;
  }> {
    const lockAcquired = await this.lockService.acquireLock(
      userId,
      operationId,
    );

    if (!lockAcquired) {
      this.logger.warn(
        `Lock already exists for userId: ${userId.toString()}, operationId: ${operationId}. Checking for existing entry.`,
      );

      // Check if entry already exists
      const existing = await this.checkExistingEntry(
        userId,
        operationId,
        currencyType,
      );

      if (existing) {
        return { lockAcquired: false, existingEntry: existing };
      }

      // Lock exists but no entry found - wait a bit and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      const retryExisting = await this.checkExistingEntry(
        userId,
        operationId,
        currencyType,
      );

      if (retryExisting) {
        return { lockAcquired: false, existingEntry: retryExisting };
      }

      return { lockAcquired: false, existingEntry: null };
    }

    return { lockAcquired: true, existingEntry: null };
  }

  /**
   * Check if ledger entry already exists
   */
  private async checkExistingEntry(
    userId: BigNumber,
    operationId: string,
    currencyType: CurrencyType,
  ): Promise<BalanceLedgerEntry | null> {
    const existing = await this.ledgerRepository.findByOperationId(
      userId,
      operationId,
      currencyType,
    );

    if (existing) {
      this.logger.log(
        `Existing ledger entry found for userId: ${userId.toString()}, operationId: ${operationId}`,
      );
    }

    return existing;
  }

  /**
   * Create a new ledger entry
   */
  private async createLedgerEntry(
    userId: BigNumber,
    operationId: string,
    currencyType: CurrencyType,
    amount: string,
    operationType: OperationType,
    operationStatus: OperationStatus,
    reason: LedgerReason,
  ): Promise<BalanceLedgerEntry> {
    const balanceAmount = BalanceAmount.fromUnit(amount);
    const ledgerEntry = await this.ledgerRepository.create(
      {
        id: randomUUID(),
        userId,
        operationId,
        currencyType,
        amount: balanceAmount,
        operationType,
        operationStatus,
        reason,
      },
      currencyType,
    );

    this.logger.log(
      `Balance entry created: ${ledgerEntry.id} for userId: ${userId.toString()}, operationId: ${operationId}`,
    );

    return ledgerEntry;
  }

  /**
   * Determine if balance should be updated based on operation status and type
   * Rules:
   * - COMPLETED + SUBTRACT → subtract balance
   * - COMPLETED + ADD → add balance
   * - PENDING or FAILED → no balance change
   * - HOLD or REFUND (when not completed) → no balance change
   *   (they will update when status changes to COMPLETED in a future call)
   */
  private shouldUpdateBalance(ledgerEntry: BalanceLedgerEntry): boolean {
    const { operationStatus } = ledgerEntry;

    // Only COMPLETED status updates balance
    // PENDING, FAILED, HOLD, REFUND (when not completed) don't update balance
    return operationStatus === OperationStatus.COMPLETED;
  }

  /**
   * Calculate new balance based on ledger entry operation
   * Only called when status is COMPLETED (checked by shouldUpdateBalance)
   * Rules:
   * - COMPLETED + ADD → add balance
   * - COMPLETED + SUBTRACT → subtract balance
   */
  private calculateNewBalance(
    currentBalance: BalanceAmount,
    ledgerEntry: BalanceLedgerEntry,
  ): BalanceAmount {
    const { operationType } = ledgerEntry;

    // This method is only called when status is COMPLETED
    // Apply operation based on type
    if (operationType === OperationType.ADD) {
      return currentBalance.add(ledgerEntry.amount);
    } else if (operationType === OperationType.SUBTRACT) {
      return currentBalance.subtract(ledgerEntry.amount);
    }

    // Should not reach here, but return current balance as fallback
    return currentBalance;
  }

  /**
   * Get currency ISO code, with fallback to default
   */
  private async getCurrencyIsoCode(
    userId: BigNumber,
    currencyType: CurrencyType,
    existingResultCurrencyIsoCode?: string,
  ): Promise<string> {
    // Use existing result currency if available
    if (existingResultCurrencyIsoCode) {
      return existingResultCurrencyIsoCode;
    }

    // Try to get from UserBalance
    const userBalance = await this.userBalanceRepository.findByUserId(userId);
    if (userBalance) {
      if (currencyType === CurrencyType.FIAT) {
        return userBalance.fiatBalance.currencyIsoCode;
      } else if (currencyType === CurrencyType.BONUS) {
        return userBalance.bonusBalance.currencyIsoCode;
      } else {
        return userBalance.cryptoBalance?.currencyIsoCode || CurrencyCode.USD;
      }
    }

    // Use default currency
    return CurrencyCode.USD;
  }

  /**
   * Update balance result incrementally after creating a ledger entry
   */
  private async updateBalanceResult(
    userId: BigNumber,
    currencyType: CurrencyType,
    ledgerEntry: BalanceLedgerEntry,
  ): Promise<void> {
    try {
      // Get existing balance result
      const existingResult = await this.balanceResultRepository.findByUserId(
        userId,
        currencyType,
      );

      // Get currency ISO code
      const currencyIsoCode = await this.getCurrencyIsoCode(
        userId,
        currencyType,
        existingResult?.currencyIsoCode,
      );

      // Calculate new balance
      const currentBalance = existingResult
        ? existingResult.balance
        : BalanceAmount.fromUnit(0);

      const newBalance = this.calculateNewBalance(currentBalance, ledgerEntry);

      // Update or create balance result
      if (existingResult) {
        await this.balanceResultRepository.update(userId, currencyType, {
          balance: newBalance,
          lastCalculatedAt: new Date(),
          lastLedgerId: ledgerEntry.id,
        });
      } else {
        await this.balanceResultRepository.create(
          {
            userId,
            balance: newBalance,
            currencyIsoCode,
            lastLedgerId: ledgerEntry.id,
          },
          currencyType,
        );
      }

      this.logger.log(
        `Balance result updated for userId: ${userId.toString()}, currencyType: ${currencyType}, new balance: ${newBalance.toUnitString()}, lastLedgerId: ${ledgerEntry.id}`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error updating balance result for userId: ${userId.toString()}, currencyType: ${currencyType}: ${message}`,
        stack,
      );
      // Don't throw - ledger entry was created successfully, balance result update can be retried via recalculation
    }
  }
}
