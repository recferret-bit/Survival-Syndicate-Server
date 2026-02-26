import BigNumber from 'bignumber.js';
import { BalanceLedgerEntry } from '@app/auth-service/domain/entities/balance-ledger-entry/balance-ledger-entry';
import {
  BalanceLedgerEntryProps,
  CreateBalanceLedgerEntry,
} from '@app/auth-service/domain/entities/balance-ledger-entry/balance-ledger-entry.type';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import {
  FiatBalanceLedger,
  BonusBalanceLedger,
  CryptoBalanceLedger,
  Prisma,
} from '@prisma/catalog';

type LedgerModel = FiatBalanceLedger | BonusBalanceLedger | CryptoBalanceLedger;

type LedgerUncheckedCreateInput =
  | Prisma.FiatBalanceLedgerUncheckedCreateInput
  | Prisma.BonusBalanceLedgerUncheckedCreateInput
  | Prisma.CryptoBalanceLedgerUncheckedCreateInput;

export class BalanceLedgerPrismaMapper {
  static toDomain(
    entity: LedgerModel,
    currencyType: CurrencyType,
  ): BalanceLedgerEntry {
    const props: BalanceLedgerEntryProps = {
      id: entity.id,
      userId: new BigNumber(entity.userId.toString()),
      operationId: entity.operationId,
      currencyType,
      amount: BalanceAmount.fromUnit(entity.amount.toString()),
      operationType: entity.operationType as OperationType,
      operationStatus: entity.operationStatus as OperationStatus,
      reason: entity.reason as LedgerReason,
      createdAt: entity.createdAt,
    };

    return new BalanceLedgerEntry(props);
  }

  static toPrisma(
    data: CreateBalanceLedgerEntry,
    currencyType: CurrencyType,
  ): LedgerUncheckedCreateInput {
    return {
      id: data.id || undefined,
      userId: BigInt(data.userId.toString()),
      operationId: data.operationId,
      currencyType,
      amount: BigInt(data.amount.toUnitString()),
      operationType: data.operationType,
      operationStatus: data.operationStatus,
      reason: data.reason,
    } as LedgerUncheckedCreateInput;
  }
}
