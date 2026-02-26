import { z } from 'zod';
import { LedgerReason } from '@app/auth-service/domain/value-objects/ledger-reason';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { OperationType } from '@app/auth-service/domain/value-objects/operation-type';
import { OperationStatus } from '@app/auth-service/domain/value-objects/operation-status';

/**
 * Zod validation schemas for Balance service
 */

export const CreateUserBalanceRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currencyIsoCodes: z
    .array(z.string().min(1, 'Currency ISO code cannot be empty'))
    .min(1, 'At least one currency ISO code is required'),
});

export const CreateUserBalanceResponseSchema = z.object({
  success: z.boolean(),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export type CreateUserBalanceRequest = z.infer<
  typeof CreateUserBalanceRequestSchema
>;
export type CreateUserBalanceResponse = z.infer<
  typeof CreateUserBalanceResponseSchema
>;

export const AddBalanceEntryRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  operationId: z.string().min(1),
  currencyType: z.nativeEnum(CurrencyType),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  operationType: z.nativeEnum(OperationType),
  operationStatus: z.nativeEnum(OperationStatus),
  reason: z.nativeEnum(LedgerReason),
});

export const AddBalanceEntryResponseSchema = z.object({
  success: z.boolean(),
  ledgerEntryId: z.string(),
});

export type AddBalanceEntryRequest = z.infer<
  typeof AddBalanceEntryRequestSchema
>;
export type AddBalanceEntryResponse = z.infer<
  typeof AddBalanceEntryResponseSchema
>;

export const GetUserBalanceRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const BalanceDtoSchema = z.object({
  currencyIsoCode: z.string().min(1, 'Currency ISO code cannot be empty'),
  balance: z
    .string()
    .regex(/^\d+$/, 'Balance must be a positive integer string'),
  balanceDecimals: z.number(),
  currencyType: z.nativeEnum(CurrencyType),
});

export const GetUserBalanceResponseSchema = z.object({
  balances: z
    .array(BalanceDtoSchema)
    .min(1, 'At least one balance is required'),
});

export type GetUserBalanceRequest = z.infer<typeof GetUserBalanceRequestSchema>;
export type GetUserBalanceResponse = z.infer<
  typeof GetUserBalanceResponseSchema
>;
export type BalanceDto = z.infer<typeof BalanceDtoSchema>;

/**
 * Subject definitions for NATS
 */
export const BalanceSubjects = {
  CREATE_USER_BALANCE: 'balance.create-user-balance.v1',
  ADD_BALANCE_ENTRY: 'balance.add-balance-entry.v1',
  GET_USER_BALANCE: 'balance.get-user-balance.v1',
} as const;

export type BalanceSubject =
  (typeof BalanceSubjects)[keyof typeof BalanceSubjects];
