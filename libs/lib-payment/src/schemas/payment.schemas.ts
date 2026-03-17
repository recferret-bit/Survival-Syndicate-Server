import { z } from 'zod';

/**
 * Placeholder schemas for Payment service (phase_1_20)
 */
export const PaymentSubjects = {
  VALIDATE_RECEIPT: 'payment.validate-receipt.v1',
} as const;

export const ValidateReceiptRequestSchema = z.object({
  receipt: z.string(),
  productId: z.string(),
});

export const ValidateReceiptResponseSchema = z.object({
  valid: z.boolean(),
});

export type ValidateReceiptRequest = z.infer<
  typeof ValidateReceiptRequestSchema
>;
export type ValidateReceiptResponse = z.infer<
  typeof ValidateReceiptResponseSchema
>;
