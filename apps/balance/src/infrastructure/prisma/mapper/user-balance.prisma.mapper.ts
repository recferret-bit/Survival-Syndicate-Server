import BigNumber from 'bignumber.js';
import { UserBalance } from '@app/balance/domain/entities/user-balance/user-balance';
import {
  UserBalanceProps,
  CreateUserBalance,
} from '@app/balance/domain/entities/user-balance/user-balance.type';
import { BalanceResultPrismaMapper } from './balance-result.prisma.mapper';
import { Prisma } from '@prisma/balance';

type UserBalanceWithRelations = Prisma.UserBalanceGetPayload<{
  include: {
    fiatBalance: true;
    bonusBalance: true;
    cryptoBalance: true;
  };
}>;

export class UserBalancePrismaMapper {
  static toDomain(entity: UserBalanceWithRelations): UserBalance {
    const props: UserBalanceProps = {
      id: entity.id,
      userId: new BigNumber(entity.userId.toString()),
      fiatBalance: BalanceResultPrismaMapper.toDomain(entity.fiatBalance),
      bonusBalance: BalanceResultPrismaMapper.toDomain(entity.bonusBalance),
      cryptoBalance: entity.cryptoBalance
        ? BalanceResultPrismaMapper.toDomain(entity.cryptoBalance)
        : undefined,
    };

    return new UserBalance(props);
  }

  static toPrisma(
    data: CreateUserBalance,
  ): Prisma.UserBalanceUncheckedCreateInput {
    if (!data.cryptoBalanceId) {
      throw new Error(
        'cryptoBalanceId is required. Please create a CryptoBalanceResult first.',
      );
    }
    return {
      id: data.id || undefined,
      userId: BigInt(data.userId.toString()),
      fiatBalanceId: data.fiatBalanceId,
      bonusBalanceId: data.bonusBalanceId,
      cryptoBalanceId: data.cryptoBalanceId,
    };
  }
}
