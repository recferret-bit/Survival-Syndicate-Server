import { z } from 'zod';

/**
 * Zod validation schemas for Users service
 */

export const UserRegisteredEventSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currencyIsoCode: z.string().min(1, 'Currency ISO code is required'),
});

export type UserRegisteredEvent = z.infer<typeof UserRegisteredEventSchema>;

/**
 * Subject definitions for NATS
 */
export const UsersSubjects = {
  USER_REGISTERED: 'users.user-registered.v1',
} as const;

export type UsersSubject = (typeof UsersSubjects)[keyof typeof UsersSubjects];
