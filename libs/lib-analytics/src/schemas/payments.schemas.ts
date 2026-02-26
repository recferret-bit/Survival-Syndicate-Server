import { z } from 'zod';
import { BonusType } from '@lib/lib-combat-progress';
import { CurrencyCode } from '@lib/shared';

/**
 * Zod validation schemas for Payments service
 */

// Deposit Completed schemas
export const DepositCompletedRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  currency: z.nativeEnum(CurrencyCode),
  transactionId: z.string().min(1),
  bonusType: z.nativeEnum(BonusType).optional(),
});

export const DepositCompletedResponseSchema = z.object({
  success: z.boolean(),
});

export type DepositCompletedRequest = z.infer<
  typeof DepositCompletedRequestSchema
>;
export type DepositCompletedResponse = z.infer<
  typeof DepositCompletedResponseSchema
>;

// Get User Stats schemas
export const GetUserStatsRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const UserStatsItemSchema = z.object({
  currency: z.string(),
  totalDeposits: z.string().regex(/^\d+$/),
  totalWithdrawals: z.string().regex(/^\d+$/),
  depositsAmount: z.string().regex(/^\d+$/),
  withdrawalsAmount: z.string().regex(/^\d+$/),
  totalRefunds: z.string().regex(/^\d+$/),
  refundsAmount: z.string().regex(/^\d+$/),
  lastDeposit: z.string().datetime().nullable(),
  lastWithdrawal: z.string().datetime().nullable(),
  lastRefund: z.string().datetime().nullable(),
});

export const GetUserStatsResponseSchema = z.object({
  stats: z.array(UserStatsItemSchema),
});

export type GetUserStatsRequest = z.infer<typeof GetUserStatsRequestSchema>;
export type GetUserStatsResponse = z.infer<typeof GetUserStatsResponseSchema>;
export type UserStatsItem = z.infer<typeof UserStatsItemSchema>;

/**
 * Subject definitions for NATS
 */
export const PaymentsSubjects = {
  PROCESS_APPROVED_TRANSACTIONS: 'payments.process-approved-transactions.v1',
  UPDATE_POLLING_TRANSACTIONS: 'payments.update-polling-transactions.v1',
  DEPOSIT_COMPLETED: 'payments.deposit.completed.v1',
  GET_USER_STATS: 'payments.user-stats.get.v1',
} as const;

export type PaymentsSubject =
  (typeof PaymentsSubjects)[keyof typeof PaymentsSubjects];
