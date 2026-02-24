import { z } from 'zod';
import { CurrencyCode } from '@lib/shared/currency';
import { BonusType } from '../types/bonus.types';

// Common schemas
export const CurrencyInfoSchema = z.object({
  isoCode: z.string().length(3),
  minDeposit: z.number().int(),
  maxDeposit: z.number().int(),
  minDepositByFreespin: z.number().int(),
  denomination: z.number().int(),
  decimal: z.number().int(),
  minBet: z.number().int(),
  maxBet: z.number().int(),
  betId: z.number().int(),
});

export const BonusDepositSchema = z.object({
  id: z.number().int(),
  status: z.string(),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  wager: z.string().regex(/^\d+$/, 'Wager must be a positive integer string'),
  totalWager: z
    .string()
    .regex(/^\d+$/, 'Total wager must be a positive integer string'),
  validUntil: z.number().int(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const BonusDepositSettingsSchema = z.object({
  name: z.string(),
  description: z.string(),
  percent: z.number().int(),
  multiplierWager: z.number().int(),
  duration: z.number().int(),
  durationFromRegistration: z.number().int().optional(),
});

export const GetBonusDepositSchema = z.object({
  type: z.string(),
  isActivated: z.boolean(),
  info: BonusDepositSettingsSchema,
  bonus: BonusDepositSchema.optional(),
});

export const FreespinInfoSchema = z.object({
  name: z.string(),
  gameId: z.string(),
  quantitySpins: z.number().int(),
  urlAlias: z.string().optional(),
  providerName: z.string().optional(),
  duration: z.number().int(),
  multiplierWager: z.number().int(),
  durationWager: z.number().int(),
});

export const BonusFreespinSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  wager: z.string().regex(/^\d+$/, 'Wager must be a positive integer string'),
  totalWager: z
    .string()
    .regex(/^\d+$/, 'Total wager must be a positive integer string'),
  quantitySpins: z.number().int(),
  wagerStartAt: z.number().int().optional(),
  wagerValidUntil: z.number().int().optional(),
  validFrom: z.number().int(),
  validUntil: z.number().int(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const GetBonusFreespinSchema = z.object({
  type: z.string(),
  isActivated: z.boolean(),
  info: FreespinInfoSchema,
  bonus: BonusFreespinSchema.optional(),
});

export const GetBonusesSchema = z.object({
  deposit: GetBonusDepositSchema.optional(),
  freespins: z.array(GetBonusFreespinSchema),
});

// Request/Response schemas
export const UserIdRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const EmptyResponseSchema = z.object({
  success: z.boolean().optional(),
});

export const CreateDepositBonusRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  depositAmount: z
    .string()
    .regex(/^\d+$/, 'Deposit amount must be a positive integer string'),
  currency: z.nativeEnum(CurrencyCode),
  type: z.nativeEnum(BonusType),
  transactionId: z.string().min(1),
});

export const CreateDepositBonusResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const DecrementWagerRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  betAmount: z
    .string()
    .regex(/^\d+$/, 'Bet amount must be a positive integer string'),
  betGameId: z.string(),
  currency: z.nativeEnum(CurrencyCode),
});

export const BonusFreespinBetRequestSchema = z.object({
  bonusFreespinId: z.string(),
  gameId: z.string(),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const BonusFreespinWinRequestSchema = z.object({
  bonusFreespinId: z.string(),
  gameId: z.string(),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const DeactivatedBonusFreespinRequestSchema = z.object({
  bonusFreespinId: z.string(),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const CheckActiveBonusesByUserIdResponseSchema = z.object({
  result: z.boolean(),
});

export const SelectBonusRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  type: z.string(),
  transactionId: z.string(),
});

export const ReceiveBonusRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  bonusDepositId: z.number().int().optional(),
  bonusFreespinId: z.string().optional(),
});

export const GetBonusesRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const GetBonusesResponseSchema = z.object({
  currencyInfo: CurrencyInfoSchema,
  bonuses: GetBonusesSchema,
});

export const DeleteSelectedBonusRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  transactionId: z.string(),
});

// Export inferred types
export type CurrencyInfo = z.infer<typeof CurrencyInfoSchema>;
export type BonusDeposit = z.infer<typeof BonusDepositSchema>;
export type BonusDepositSettings = z.infer<typeof BonusDepositSettingsSchema>;
export type GetBonusDeposit = z.infer<typeof GetBonusDepositSchema>;
export type FreespinInfo = z.infer<typeof FreespinInfoSchema>;
export type BonusFreespin = z.infer<typeof BonusFreespinSchema>;
export type GetBonusFreespin = z.infer<typeof GetBonusFreespinSchema>;
export type GetBonuses = z.infer<typeof GetBonusesSchema>;
export type UserIdRequest = z.infer<typeof UserIdRequestSchema>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
export type CreateDepositBonusRequest = z.infer<
  typeof CreateDepositBonusRequestSchema
>;
export type CreateDepositBonusResponse = z.infer<
  typeof CreateDepositBonusResponseSchema
>;
export type DecrementWagerRequest = z.infer<typeof DecrementWagerRequestSchema>;
export type BonusFreespinBetRequest = z.infer<
  typeof BonusFreespinBetRequestSchema
>;
export type BonusFreespinWinRequest = z.infer<
  typeof BonusFreespinWinRequestSchema
>;
export type DeactivatedBonusFreespinRequest = z.infer<
  typeof DeactivatedBonusFreespinRequestSchema
>;
export type CheckActiveBonusesByUserIdResponse = z.infer<
  typeof CheckActiveBonusesByUserIdResponseSchema
>;
export type SelectBonusRequest = z.infer<typeof SelectBonusRequestSchema>;
export type ReceiveBonusRequest = z.infer<typeof ReceiveBonusRequestSchema>;
export type GetBonusesRequest = z.infer<typeof GetBonusesRequestSchema>;
export type GetBonusesResponse = z.infer<typeof GetBonusesResponseSchema>;
export type DeleteSelectedBonusRequest = z.infer<
  typeof DeleteSelectedBonusRequestSchema
>;

/**
 * Subject definitions for NATS
 */
export const BonusSubjects = {
  CREATE_DEPOSIT_BONUS: 'bonus.deposit.create',
  DECREMENT_WAGER: 'bonus.wager.decrement',
  DEACTIVATE_BONUS_DEPOSIT: 'bonus.deposit.deactivate',
  BONUS_FREESPIN_BET: 'bonus.freespin.bet',
  BONUS_FREESPIN_WIN: 'bonus.freespin.win',
  DEACTIVATE_BONUS_FREESPIN: 'bonus.freespin.deactivate',
  CHECK_ACTIVE_BONUSES: 'bonus.bonuses.checkActive',
  SELECT_BONUS: 'bonus.bonus.select',
  RECEIVE_BONUS: 'bonus.bonus.receive',
  GET_BONUSES: 'bonus.bonuses.get',
  DELETE_SELECTED_BONUS: 'bonus.selectedBonus.delete',
} as const;

export type BonusSubject = (typeof BonusSubjects)[keyof typeof BonusSubjects];
