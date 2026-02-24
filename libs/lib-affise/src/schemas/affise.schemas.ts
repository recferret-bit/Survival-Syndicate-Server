import { z } from 'zod';

/**
 * Zod validation schemas for Affise service
 */

export const FirstDepositRequestSchema = z.object({
  clickId: z.string().min(1, 'Click ID is required'),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  depositAmount: z
    .string()
    .regex(/^\d+$/, 'Deposit amount must be a positive integer string'),
  depositIsoCode: z.string().length(3, 'ISO code must be 3 characters'),
});

export const EmptyResponseSchema = z.object({
  success: z.boolean().optional(),
});

export type FirstDepositRequest = z.infer<typeof FirstDepositRequestSchema>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const AffiseSubjects = {
  FIRST_DEPOSIT: 'affise.firstDeposit',
  RUN_EXPORT_DATA: 'affise.runExportData',
} as const;

export type AffiseSubject =
  (typeof AffiseSubjects)[keyof typeof AffiseSubjects];
