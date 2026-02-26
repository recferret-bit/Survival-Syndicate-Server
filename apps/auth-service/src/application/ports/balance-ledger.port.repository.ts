import BigNumber from 'bignumber.js';
import { BalanceLedgerEntry } from '@app/auth-service/domain/entities/balance-ledger-entry/balance-ledger-entry';
import { CreateBalanceLedgerEntry } from '@app/auth-service/domain/entities/balance-ledger-entry/balance-ledger-entry.type';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';

export abstract class BalanceLedgerPortRepository {
  abstract create(
    data: CreateBalanceLedgerEntry,
    currencyType: CurrencyType,
  ): Promise<BalanceLedgerEntry>;

  abstract findByOperationId(
    userId: BigNumber,
    operationId: string,
    currencyType: CurrencyType,
  ): Promise<BalanceLedgerEntry | null>;

  abstract findByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
    limit?: number,
    offset?: number,
  ): Promise<BalanceLedgerEntry[]>;

  abstract findAfterLedgerId(
    userId: BigNumber,
    currencyType: CurrencyType,
    lastLedgerId: string,
    limit?: number,
  ): Promise<BalanceLedgerEntry[]>;

  abstract countByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
  ): Promise<number>;
}
