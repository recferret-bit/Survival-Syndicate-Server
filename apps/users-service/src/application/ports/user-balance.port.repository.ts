import BigNumber from 'bignumber.js';
import { UserBalance } from '@app/users-service/domain/entities/user-balance/user-balance';
import { CreateUserBalance } from '@app/users-service/domain/entities/user-balance/user-balance.type';

export abstract class UserBalancePortRepository {
  abstract findByUserId(userId: BigNumber): Promise<UserBalance | null>;

  abstract create(data: CreateUserBalance): Promise<UserBalance>;

  abstract exists(userId: BigNumber): Promise<boolean>;
}
