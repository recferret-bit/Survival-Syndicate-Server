import { z } from 'zod';

/**
 * Zod validation schemas for Matchmaking service
 */

export const TestMatchmakingRequestSchema = z.object({});

export const TestMatchmakingResponseSchema = z.object({
  success: z.boolean(),
});

export type TestMatchmakingRequest = z.infer<
  typeof TestMatchmakingRequestSchema
>;
export type TestMatchmakingResponse = z.infer<
  typeof TestMatchmakingResponseSchema
>;

/**
 * Subject definitions for NATS
 */
export const MatchmakingSubjects = {
  TEST: 'matchmaking.test.v1',
} as const;

export type MatchmakingSubject =
  (typeof MatchmakingSubjects)[keyof typeof MatchmakingSubjects];
