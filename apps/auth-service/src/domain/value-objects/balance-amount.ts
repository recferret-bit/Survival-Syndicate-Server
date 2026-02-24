import BigNumber from 'bignumber.js';
import { ValidationException } from '@lib/shared/application';

export class BalanceAmount {
  private readonly amount: BigNumber;

  constructor(amount: string | number | BigNumber) {
    const bn = new BigNumber(amount);

    if (bn.isNaN()) {
      throw new ValidationException({
        amount: ['Amount must be a valid number.'],
      });
    }

    if (!bn.isInteger()) {
      throw new ValidationException({
        amount: ['Amount must be an integer (smallest currency unit).'],
      });
    }

    this.amount = bn;
  }

  static fromUnit(amount: string | number): BalanceAmount {
    return new BalanceAmount(amount);
  }

  static fromDecimal(amount: string | number, decimals: number): BalanceAmount {
    const smallestUnitAmount = new BigNumber(amount).multipliedBy(
      new BigNumber(10).pow(decimals),
    );
    return new BalanceAmount(smallestUnitAmount.toFixed(0));
  }

  getAmount(): BigNumber {
    return this.amount;
  }

  toUnitString(): string {
    return this.amount.toFixed();
  }

  toUnitNumber(): number {
    return this.amount.toNumber();
  }

  toDecimalNumber(decimals: number): number {
    return this.amount.dividedBy(new BigNumber(10).pow(decimals)).toNumber();
  }

  add(other: BalanceAmount): BalanceAmount {
    return new BalanceAmount(this.amount.plus(other.amount));
  }

  subtract(other: BalanceAmount): BalanceAmount {
    return new BalanceAmount(this.amount.minus(other.amount));
  }

  isLessThan(other: BalanceAmount): boolean {
    return this.amount.lt(other.amount);
  }

  isLessThanOrEqual(other: BalanceAmount): boolean {
    return this.amount.lte(other.amount);
  }

  isGreaterThan(other: BalanceAmount): boolean {
    return this.amount.gt(other.amount);
  }

  isGreaterThanOrEqual(other: BalanceAmount): boolean {
    return this.amount.gte(other.amount);
  }

  isEqual(other: BalanceAmount): boolean {
    return this.amount.eq(other.amount);
  }

  isNegative(): boolean {
    return this.toUnitNumber() < 0;
  }

  isZero(): boolean {
    return this.amount.isZero();
  }
}
