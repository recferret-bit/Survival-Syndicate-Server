import BigNumber from 'bignumber.js';
import { BalanceAmount } from '../../value-objects/balance-amount';

export interface BalanceResultProps {
  id: string;
  userId: BigNumber;
  balance: BalanceAmount;
  currencyIsoCode: string;
  lastCalculatedAt: Date;
  lastLedgerId?: string;
}

export interface CreateBalanceResult
  extends Omit<BalanceResultProps, 'id' | 'lastCalculatedAt'> {
  id?: string;
}

export interface UpdateBalanceResult {
  balance: BalanceAmount;
  lastCalculatedAt: Date;
  lastLedgerId?: string;
}
