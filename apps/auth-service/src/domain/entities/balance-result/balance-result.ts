import BigNumber from 'bignumber.js';
import { Entity } from '@lib/shared';
import { BalanceResultProps } from './balance-result.type';
import { BalanceAmount } from '../../value-objects/balance-amount';

export class BalanceResult extends Entity<BalanceResultProps> {
  constructor(props: BalanceResultProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): BigNumber {
    return this.props.userId;
  }

  get balance(): BalanceAmount {
    return this.props.balance;
  }

  get currencyIsoCode(): string {
    return this.props.currencyIsoCode;
  }

  get lastCalculatedAt(): Date {
    return this.props.lastCalculatedAt;
  }

  get lastLedgerId(): string | undefined {
    return this.props.lastLedgerId;
  }

  hasBalance(): boolean {
    return !this.props.balance.isZero();
  }

  isNegative(): boolean {
    return this.props.balance.isNegative();
  }
}
