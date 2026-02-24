import BigNumber from 'bignumber.js';
import { BalanceResult } from '@app/balance/domain/entities/balance-result/balance-result';
import {
  CreateBalanceResult,
  UpdateBalanceResult,
} from '@app/balance/domain/entities/balance-result/balance-result.type';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';

export abstract class BalanceResultPortRepository {
  abstract create(
    data: CreateBalanceResult,
    currencyType: CurrencyType,
  ): Promise<BalanceResult>;

  abstract findByUserId(
    userId: BigNumber,
    currencyType: CurrencyType,
  ): Promise<BalanceResult | null>;

  abstract update(
    userId: BigNumber,
    currencyType: CurrencyType,
    data: UpdateBalanceResult,
  ): Promise<BalanceResult>;

  abstract upsert(
    userId: BigNumber,
    currencyType: CurrencyType,
    createData: CreateBalanceResult,
    updateData: UpdateBalanceResult,
  ): Promise<BalanceResult>;
}
