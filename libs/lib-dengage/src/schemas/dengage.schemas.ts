import { z } from 'zod';

/**
 * Zod validation schemas for Dengage service
 */

export const PasswordRecoveryRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  link: z.string().url('Invalid recovery link URL'),
  language: z.string().min(2, 'Language code required').max(5),
});

export const EmptyResponseSchema = z.object({
  success: z.boolean().optional(),
});

export type PasswordRecoveryRequest = z.infer<
  typeof PasswordRecoveryRequestSchema
>;
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const DengageSubjects = {
  PASSWORD_RECOVERY: 'dengage.passwordRecovery',
  RUN_SYNC_CONTACTS: 'dengage.syncContacts',
} as const;

export type DengageSubject =
  (typeof DengageSubjects)[keyof typeof DengageSubjects];
