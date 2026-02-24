import BigNumber from 'bignumber.js';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import type { AddBalanceEntryRequest } from '../schemas/balance.schemas';

/**
 * Build the balance entry request with proper type conversions
 * Shared utility function for building AddBalanceEntryRequest
 *
 * @param userId - User ID as BigNumber
 * @param amount - Amount in smallest currency unit as BigNumber
 * @param operationId - Unique operation ID
 * @param operationType - Operation type (ADD/SUBTRACT)
 * @param reason - Ledger reason
 * @param currencyType - Currency type (defaults to FIAT)
 * @param operationStatus - Operation status (defaults to COMPLETED)
 * @returns AddBalanceEntryRequest
 */
export function buildBalanceEntryRequest(
  userId: BigNumber,
  amount: BigNumber,
  operationId: string,
  operationType: OperationType,
  reason: LedgerReason,
  currencyType: CurrencyType = CurrencyType.FIAT,
  operationStatus: OperationStatus = OperationStatus.COMPLETED,
): AddBalanceEntryRequest {
  return {
    userId: userId.toString(),
    operationId,
    currencyType,
    amount: amount.toFixed(0),
    operationType,
    operationStatus,
    reason,
  };
}
