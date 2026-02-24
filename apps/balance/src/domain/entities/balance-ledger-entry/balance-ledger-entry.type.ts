import BigNumber from 'bignumber.js';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';

export interface BalanceLedgerEntryProps {
  id: string;
  userId: BigNumber;
  operationId: string;
  currencyType: CurrencyType;
  amount: BalanceAmount;
  operationType: OperationType;
  operationStatus: OperationStatus;
  reason: LedgerReason;
  createdAt: Date;
}

export interface CreateBalanceLedgerEntry
  extends Omit<BalanceLedgerEntryProps, 'id' | 'createdAt'> {
  id?: string;
}
