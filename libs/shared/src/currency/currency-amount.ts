import BigNumber from 'bignumber.js';
import { CurrencyValue } from './currency';

export class CurrencyAmount {
  private amount: BigNumber;
  private readonly currency: CurrencyValue;

  constructor(amount: string | number, currency: CurrencyValue) {
    this.amount = new BigNumber(amount);

    if (this.amount.isNaN()) {
      throw new Error('Amount must be a valid number.');
    }

    if (!this.amount.isInteger()) {
      throw new Error('Amount must be an integer.');
    }

    if (!CurrencyValue.validateCurrency(currency)) {
      throw new Error('Currency must be an instance of Currency.');
    }

    this.currency = currency;
  }

  // Create Money instance from the smallest currency unit (e.g., cents or kopecks)
  static fromUnit(
    amount: string | number,
    currency: CurrencyValue,
  ): CurrencyAmount {
    return new CurrencyAmount(amount, currency);
  }

  // Create Money instance from standard format (e.g., 0.00)
  static fromDecimal(
    amount: string | number,
    currency: CurrencyValue,
  ): CurrencyAmount {
    const smallestUnitAmount = new BigNumber(amount).multipliedBy(
      new BigNumber(10).pow(currency.getDecimals()),
    );
    return new CurrencyAmount(smallestUnitAmount.toFixed(0), currency);
  }

  static validateMoney(money: unknown): boolean {
    return money instanceof CurrencyAmount;
  }

  public resetToZero(): void {
    this.amount = new BigNumber(0);
  }

  public getCurrency(): CurrencyValue {
    return this.currency;
  }

  public getAmount(): BigNumber {
    return this.amount;
  }

  public getCurrencyCode(): string {
    return this.currency.getIsoCode();
  }

  public add(other: CurrencyAmount): CurrencyAmount {
    this.assertSameCurrency(other);
    return new CurrencyAmount(
      this.amount.plus(other.amount).toFixed(),
      this.currency,
    );
  }

  public sub(other: CurrencyAmount): CurrencyAmount {
    this.assertSameCurrency(other);
    return new CurrencyAmount(
      this.amount.minus(other.amount).toFixed(),
      this.currency,
    );
  }

  public multiplyBy(multiplier: number): CurrencyAmount {
    return new CurrencyAmount(
      this.amount.times(multiplier).toFixed(),
      this.currency,
    );
  }

  public divideBy(divisor: number): CurrencyAmount {
    return new CurrencyAmount(
      this.amount.dividedBy(divisor).toFixed(),
      this.currency,
    );
  }

  /**
   * Returns the amount in the smallest currency unit (e.g., cents or kopecks) 100 cents = 1 USD
   * @returns string
   */
  public toUnitString(): string {
    return this.amount.toFixed();
  }

  /**
   * Returns the amount in the smallest currency unit (e.g., cents or kopecks) 100 cents = 1 USD
   */
  public toUnitNumber(): number {
    return this.amount.toNumber();
  }

  /**
   * Returns the amount in the standard format (e.g., 0.00)
   */
  public toDecimalNumber(): number {
    return this.amount
      .dividedBy(new BigNumber(10).pow(this.currency.getDecimals()))
      .toNumber();
  }

  /**
   * Returns the amount in the standard format (e.g., 0.00)
   * @returns string
   */
  public toDecimalString(): string {
    return this.amount
      .dividedBy(new BigNumber(10).pow(this.currency.getDecimals()))
      .toFixed(this.currency.getDecimals());
  }

  /**
   * Returns the amount in the standard format with the currency code (e.g., 0.00 USD)
   * @returns string
   */
  public toFormattedStringWithCurrency(): string {
    return `${this.amount
      .dividedBy(new BigNumber(10).pow(this.currency.getDecimals()))
      .toFixed(this.currency.getDecimals())} ${this.currency.getIsoCode()}`;
  }

  private validateCurrencyAmountInstance(other: CurrencyAmount): void {
    if (!CurrencyAmount.validateMoney(other)) {
      throw new Error('Other must be an instance of Money.');
    }
  }

  private assertSameCurrency(other: CurrencyAmount): void {
    this.validateCurrencyAmountInstance(other);
    if (!this.currency.equals(other.currency)) {
      throw new Error('Currency must be the same to perform operations.');
    }
  }

  public isLessThan(other: CurrencyAmount): boolean {
    this.assertSameCurrency(other);
    return this.amount.lt(other.amount);
  }

  public isLessThanOrEqual(other: CurrencyAmount): boolean {
    this.assertSameCurrency(other);
    return this.amount.lte(other.amount);
  }

  public isGreaterThan(other: CurrencyAmount): boolean {
    this.assertSameCurrency(other);
    return this.amount.gt(other.amount);
  }

  public isGreaterThanOrEqual(other: CurrencyAmount): boolean {
    this.assertSameCurrency(other);
    return this.amount.gte(other.amount);
  }

  public isEqual(other: CurrencyAmount): boolean {
    this.assertSameCurrency(other);
    return this.amount.eq(other.amount);
  }

  public isEqualAmount(amount: BigNumber | number): boolean {
    return this.amount.eq(amount);
  }

  isNegative(): boolean {
    return this.toUnitNumber() < 0;
  }
}
