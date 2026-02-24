import BigNumber from 'bignumber.js';

/**
 * Convert a number to BigNumber
 * @param number - Number to convert
 * @returns BigNumber value
 */
export function numberToBigNumber(number: number): BigNumber {
  return new BigNumber(number);
}

/**
 * Convert a decimal amount string to BigNumber in smallest currency unit (cents)
 * Uses bignumber.js for precise decimal arithmetic to avoid precision loss
 *
 * @param decimalAmount - Decimal amount as string (e.g., "10.50")
 * @param decimals - Number of decimal places (default: 2 for cents)
 * @returns BigNumber value in smallest currency unit (e.g., 1050 for "10.50")
 */
export function decimalToBigNumber(
  decimalAmount: string,
  decimals: number = 2,
): BigNumber {
  const multiplier = new BigNumber(10).pow(decimals);
  const amount = new BigNumber(decimalAmount);
  const result = amount.multipliedBy(multiplier);

  // Round to nearest integer
  // Using integerValue with ROUND_HALF_UP for proper rounding
  return result.integerValue(BigNumber.ROUND_HALF_UP);
}

/**
 * Convert a BigNumber amount from smallest currency unit to decimal string
 *
 * @param amount - BigNumber amount in smallest currency unit (e.g., 1050)
 * @param decimals - Number of decimal places (default: 2 for cents)
 * @returns Decimal string (e.g., "10.50")
 */
export function bigNumberToDecimal(
  amount: BigNumber | string | number,
  decimals: number = 2,
): string {
  const divisor = new BigNumber(10).pow(decimals);
  const amountBN = new BigNumber(amount.toString());
  const result = amountBN.dividedBy(divisor);

  return result.toFixed(decimals);
}

/**
 * Convert an integer string to BigNumber
 * This is a convenience function for cases where the amount is already in smallest currency unit
 * and provided as a string (e.g., "10000" -> BigNumber(10000))
 *
 * @param integerString - Integer amount as string (e.g., "10000")
 * @returns BigNumber value (e.g., BigNumber(10000))
 */
export function stringToBigNumber(integerString: string): BigNumber {
  return new BigNumber(integerString);
}

/**
 * @deprecated Use decimalToBigNumber instead
 * Convert a decimal amount string to BigInt in smallest currency unit (cents)
 */
export function decimalToBigInt(
  decimalAmount: string,
  decimals: number = 2,
): bigint {
  const multiplier = new BigNumber(10).pow(decimals);
  const amount = new BigNumber(decimalAmount);
  const result = amount.multipliedBy(multiplier);

  // Round to nearest integer and convert to BigInt
  // Using integerValue with ROUND_HALF_UP for proper rounding
  return BigInt(result.integerValue(BigNumber.ROUND_HALF_UP).toString());
}

/**
 * @deprecated Use bigNumberToDecimal instead
 * Convert a BigInt amount from smallest currency unit to decimal string
 */
export function bigIntToDecimal(amount: bigint, decimals: number = 2): string {
  const divisor = new BigNumber(10).pow(decimals);
  const amountBN = new BigNumber(amount.toString());
  const result = amountBN.dividedBy(divisor);

  return result.toFixed(decimals);
}

/**
 * @deprecated Use stringToBigNumber instead
 * Convert an integer string to BigInt
 */
export function stringToBigInt(integerString: string): bigint {
  return BigInt(integerString);
}

/**
 * Convert BigNumber to bigint for Prisma database operations
 * This is the standard way to convert BigNumber to bigint when working with Prisma
 * Use this in mappers when converting domain BigNumber values to Prisma bigint types
 *
 * @param value - BigNumber value to convert
 * @returns bigint value for Prisma
 * @example
 * ```ts
 * const userIdBigInt = bigNumberToBigInt(data.userId);
 * ```
 */
export function bigNumberToBigInt(value: BigNumber): bigint {
  return BigInt(value.toString());
}

/**
 * Convert bigint from Prisma to BigNumber for domain operations
 * This is the standard way to convert Prisma bigint values to BigNumber
 * Use this in mappers when converting Prisma bigint types to domain BigNumber values
 *
 * @param value - bigint value from Prisma
 * @returns BigNumber value for domain
 * @example
 * ```ts
 * const userId = bigIntToBigNumber(entity.userId);
 * ```
 */
export function bigIntToBigNumber(value: bigint): BigNumber {
  return new BigNumber(value.toString());
}

/** Standard decimal places for cents representation */
const CENTS_DECIMALS = 2;

/**
 * Convert balance from source decimal precision to cents (2 decimal places)
 *
 * Balance services may store amounts with variable decimal precision.
 * This function normalizes to cents (2 decimals) for Money/currency operations.
 *
 * @param balanceString - Balance amount as string in source decimals
 * @param sourceDecimals - Number of decimal places in the source balance
 * @returns BigNumber value in cents (2 decimal places)
 *
 * @example
 * ```ts
 * // Balance of 1200000 with 4 decimals = 120.0000 in major units
 * // Converted to cents: 12000 (120.00)
 * convertToCents('1200000', 4) // Returns BigNumber(12000)
 *
 * // Balance already in cents (2 decimals) - no conversion needed
 * convertToCents('1050', 2) // Returns BigNumber(1050)
 * ```
 */
export function convertToCents(
  balanceString: string,
  sourceDecimals: number,
): BigNumber {
  const balance = new BigNumber(balanceString);

  if (sourceDecimals === CENTS_DECIMALS) {
    return balance;
  }

  const decimalDiff = sourceDecimals - CENTS_DECIMALS;
  const divisor = new BigNumber(10).pow(decimalDiff);

  return balance.dividedBy(divisor).integerValue(BigNumber.ROUND_DOWN);
}
