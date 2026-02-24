import BigNumber from 'bignumber.js';
import { BalanceResult } from '../balance-result/balance-result';

export interface UserBalanceProps {
  id: string;
  userId: BigNumber;
  fiatBalance: BalanceResult;
  bonusBalance: BalanceResult;
  cryptoBalance?: BalanceResult;
}

export interface CreateUserBalance {
  id?: string;
  userId: BigNumber;
  fiatBalanceId: string;
  bonusBalanceId: string;
  cryptoBalanceId?: string;
}
