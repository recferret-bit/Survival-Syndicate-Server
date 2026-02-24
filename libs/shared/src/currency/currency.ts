import { ValidationException } from '@lib/shared/application';

export class CurrencyValue {
  constructor(
    private readonly name: string,
    private readonly symbol: string,
    private readonly isoCode: string,
    private readonly isActive: boolean,
    private readonly decimals: number,
  ) {
    if (!Number.isInteger(decimals)) {
      throw new ValidationException({
        decimals: ['Decimals must be an integer.'],
      });
    }
    if (decimals <= 0) {
      throw new ValidationException({
        decimals: ['Decimals must be greater than 0.'],
      });
    }
  }

  public getName(): string {
    return this.name;
  }

  public getSymbol(): string {
    return this.symbol;
  }

  public getIsoCode(): string {
    return this.isoCode;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getDecimals(): number {
    return this.decimals;
  }

  public equals(other: CurrencyValue): boolean {
    if (!CurrencyValue.validateCurrency(other)) {
      return false;
    }
    return (
      this.name === other.name &&
      this.symbol === other.symbol &&
      this.isoCode === other.isoCode &&
      this.isActive === other.isActive &&
      this.decimals === other.decimals
    );
  }

  static validateCurrency(currency: unknown): boolean {
    return currency instanceof CurrencyValue;
  }
}

export const Currencies = [
  new CurrencyValue('Taka', '৳', 'BDT', true, 2),
  new CurrencyValue('Euro', '€', 'EUR', true, 2),
  new CurrencyValue('US Dollar', '$', 'USD', true, 2),
];

export function getCurrencyVelueByCurrencyCode(
  code: CurrencyCode,
): CurrencyValue {
  const currency = Currencies.find(
    (currency) => currency.getIsoCode() === code.toString(),
  );
  if (!currency) {
    throw new ValidationException({
      currency: ['Currency not found.'],
    });
  }
  return currency;
}

export function getCurrencyVelueByStringCode(code: string): CurrencyValue {
  const currency = Currencies.find(
    (currency) => currency.getIsoCode() === code,
  );
  if (!currency) {
    throw new ValidationException({
      currency: ['Currency not found.'],
    });
  }
  return currency;
}

// CurrencyCode enum for domain usage (matches Prisma schema lowercase values)
export enum CurrencyCode {
  BDT = 'BDT',
  EUR = 'EUR',
  USD = 'USD',
}

export function getCurrencyCodeByStringCode(code: string): CurrencyCode {
  const currencyCode = Object.values(CurrencyCode).find(
    (currency) => currency === code,
  );
  if (!currencyCode) {
    throw new ValidationException({
      code: ['Currency code not found.'],
    });
  }
  return currencyCode;
}

// Re-export CurrencyValue as CurrencyClass for backward compatibility where the class is needed
// Note: The enum CurrencyCode takes precedence for value usage (CurrencyCode.USD)
export { CurrencyValue as CurrencyClass };
