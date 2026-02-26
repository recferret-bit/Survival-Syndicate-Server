import BigNumber from 'bignumber.js';
import { BalanceResult } from '@app/auth-service/domain/entities/balance-result/balance-result';
import {
  BalanceResultProps,
  CreateBalanceResult,
  UpdateBalanceResult,
} from '@app/auth-service/domain/entities/balance-result/balance-result.type';
import { BalanceAmount } from '@app/auth-service/domain/value-objects/balance-amount';
import {
  FiatBalanceResult,
  BonusBalanceResult,
  CryptoBalanceResult,
  Prisma,
} from '@prisma/catalog';

type ResultModel = FiatBalanceResult | BonusBalanceResult | CryptoBalanceResult;

type ResultUncheckedCreateInput =
  | Prisma.FiatBalanceResultUncheckedCreateInput
  | Prisma.BonusBalanceResultUncheckedCreateInput
  | Prisma.CryptoBalanceResultUncheckedCreateInput;

type ResultUncheckedUpdateInput =
  | Prisma.FiatBalanceResultUncheckedUpdateInput
  | Prisma.BonusBalanceResultUncheckedUpdateInput
  | Prisma.CryptoBalanceResultUncheckedUpdateInput;

export class BalanceResultPrismaMapper {
  static toDomain(entity: ResultModel): BalanceResult {
    const props: BalanceResultProps = {
      id: entity.id,
      userId: new BigNumber(entity.userId.toString()),
      balance: BalanceAmount.fromUnit(entity.balance.toString()),
      currencyIsoCode: entity.currencyIsoCode,
      lastCalculatedAt: entity.lastCalculatedAt,
      lastLedgerId: entity.lastLedgerId || undefined,
    };

    return new BalanceResult(props);
  }

  static toPrismaCreate(data: CreateBalanceResult): ResultUncheckedCreateInput {
    return {
      id: data.id || undefined,
      userId: BigInt(data.userId.toString()),
      balance: BigInt(data.balance.toUnitString()),
      currencyIsoCode: data.currencyIsoCode,
      lastLedgerId: data.lastLedgerId || null,
    } as ResultUncheckedCreateInput;
  }

  static toPrismaUpdate(data: UpdateBalanceResult): ResultUncheckedUpdateInput {
    return {
      balance: BigInt(data.balance.toUnitString()),
      lastCalculatedAt: data.lastCalculatedAt,
      lastLedgerId: data.lastLedgerId || null,
    } as ResultUncheckedUpdateInput;
  }
}
