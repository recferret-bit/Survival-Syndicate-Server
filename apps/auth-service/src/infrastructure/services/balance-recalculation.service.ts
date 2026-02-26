import BigNumber from 'bignumber.js';
import { Injectable, Logger } from '@nestjs/common';
import { BalanceLedgerPortRepository } from '@app/auth-service/application/ports/balance-ledger.port.repository';
import { BalanceResultPortRepository } from '@app/auth-service/application/ports/balance-result.port.repository';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';

@Injectable()
export class BalanceRecalculationService {
  private readonly logger = new Logger(BalanceRecalculationService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    private readonly ledgerRepository: BalanceLedgerPortRepository,
    private readonly resultRepository: BalanceResultPortRepository,
  ) {}

  /**
   * Recalculate balance for a user and currency type using batched processing
   * Processes ledger entries in batches to avoid blocking the event loop
   */
  async recalculateBalance(
    userId: BigNumber,
    currencyType: CurrencyType,
    currencyIsoCode: string,
  ): Promise<void> {
    this.logger.log(
      `Starting balance recalculation for userId: ${userId.toString()}, currencyType: ${currencyType}`,
    );

    // Get existing balance result to find last processed ledger ID
    const existingResult = await this.resultRepository.findByUserId(
      userId,
      currencyType,
    );

    let lastLedgerId: string | undefined = existingResult?.lastLedgerId;
    let currentBalance = existingResult
      ? existingResult.balance
      : BalanceAmount.fromUnit(0);

    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch batch of ledger entries
      const batch = await this.ledgerRepository.findAfterLedgerId(
        userId,
        currencyType,
        lastLedgerId || '',
        this.BATCH_SIZE,
      );

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      // Process batch
      for (const entry of batch) {
        // Only process completed entries
        if (!entry.isCompleted()) {
          continue;
        }

        // Apply operation
        if (entry.isAddOperation()) {
          currentBalance = currentBalance.add(entry.amount);
        } else if (entry.isSubtractOperation()) {
          currentBalance = currentBalance.subtract(entry.amount);
        }

        lastLedgerId = entry.id;
        totalProcessed++;
      }

      // Yield to event loop after each batch
      await new Promise((resolve) => setImmediate(resolve));

      // Check if we got a full batch (might have more)
      hasMore = batch.length === this.BATCH_SIZE;
    }

    // Update or create balance result
    const updateData = {
      balance: currentBalance,
      lastCalculatedAt: new Date(),
      lastLedgerId,
    };

    if (existingResult) {
      await this.resultRepository.update(userId, currencyType, updateData);
    } else {
      await this.resultRepository.create(
        {
          userId,
          balance: currentBalance,
          currencyIsoCode,
          lastLedgerId,
        },
        currencyType,
      );
    }

    this.logger.log(
      `Balance recalculation completed for userId: ${userId.toString()}, currencyType: ${currencyType}, processed: ${totalProcessed} entries, final balance: ${currentBalance.toUnitString()}`,
    );
  }

  /**
   * Recalculate balance from scratch (ignoring lastLedgerId)
   */
  async recalculateBalanceFromScratch(
    userId: BigNumber,
    currencyType: CurrencyType,
    currencyIsoCode: string,
  ): Promise<void> {
    this.logger.log(
      `Starting full balance recalculation from scratch for userId: ${userId.toString()}, currencyType: ${currencyType}`,
    );

    let currentBalance = BalanceAmount.fromUnit(0);
    let lastLedgerId: string | undefined;
    let offset = 0;
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch batch of ledger entries
      const batch = await this.ledgerRepository.findByUserId(
        userId,
        currencyType,
        this.BATCH_SIZE,
        offset,
      );

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      // Process batch
      for (const entry of batch) {
        // Only process completed entries
        if (!entry.isCompleted()) {
          continue;
        }

        // Apply operation
        if (entry.isAddOperation()) {
          currentBalance = currentBalance.add(entry.amount);
        } else if (entry.isSubtractOperation()) {
          currentBalance = currentBalance.subtract(entry.amount);
        }

        lastLedgerId = entry.id;
        totalProcessed++;
      }

      offset += batch.length;

      // Yield to event loop after each batch
      await new Promise((resolve) => setImmediate(resolve));

      // Check if we got a full batch (might have more)
      hasMore = batch.length === this.BATCH_SIZE;
    }

    // Upsert balance result
    await this.resultRepository.upsert(
      userId,
      currencyType,
      {
        userId,
        balance: currentBalance,
        currencyIsoCode,
        lastLedgerId,
      },
      {
        balance: currentBalance,
        lastCalculatedAt: new Date(),
        lastLedgerId,
      },
    );

    this.logger.log(
      `Full balance recalculation completed for userId: ${userId.toString()}, currencyType: ${currencyType}, processed: ${totalProcessed} entries, final balance: ${currentBalance.toUnitString()}`,
    );
  }
}
