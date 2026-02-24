/**
 * Bonus Type enum - shared across all services
 * Used for identifying bonus types in payment transactions, bonus activation, etc.
 */
export enum BonusType {
  DEPOSIT = 'deposit',
  FREESPINS = 'freespins',
}

/**
 * Type for bonus type values
 */
export type BonusTypeValue = BonusType.DEPOSIT | BonusType.FREESPINS;

/**
 * Array of all bonus type values (for validation)
 */
export const BONUS_TYPE_VALUES = [
  BonusType.DEPOSIT,
  BonusType.FREESPINS,
] as const;
