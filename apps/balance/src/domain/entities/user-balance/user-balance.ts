import BigNumber from 'bignumber.js';
import { Entity } from '../entity';
import { UserBalanceProps } from './user-balance.type';
import { BalanceResult } from '../balance-result/balance-result';

export class UserBalance extends Entity<UserBalanceProps> {
  constructor(props: UserBalanceProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): BigNumber {
    return this.props.userId;
  }

  get fiatBalance(): BalanceResult {
    return this.props.fiatBalance;
  }

  get bonusBalance(): BalanceResult {
    return this.props.bonusBalance;
  }

  get cryptoBalance(): BalanceResult | undefined {
    return this.props.cryptoBalance;
  }

  hasCryptoBalance(): boolean {
    return this.props.cryptoBalance !== undefined;
  }
}
