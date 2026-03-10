import { z } from 'zod';

/**
 * Zod validation schemas for Users service
 */

export const TestUsersRequestSchema = z.object({});

export const TestUsersResponseSchema = z.object({
  success: z.boolean(),
});

export type TestUsersRequest = z.infer<typeof TestUsersRequestSchema>;
export type TestUsersResponse = z.infer<typeof TestUsersResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const UsersSubjects = {
  TEST: 'users.test.v1',
} as const;

export type UsersSubject = (typeof UsersSubjects)[keyof typeof UsersSubjects];
