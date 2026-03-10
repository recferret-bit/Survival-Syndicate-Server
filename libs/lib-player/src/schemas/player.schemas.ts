import { z } from 'zod';

/**
 * Zod validation schemas for Player service
 */

export const TestPlayerRequestSchema = z.object({});

export const TestPlayerResponseSchema = z.object({
  success: z.boolean(),
});

export type TestPlayerRequest = z.infer<typeof TestPlayerRequestSchema>;
export type TestPlayerResponse = z.infer<typeof TestPlayerResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const PlayerSubjects = {
  TEST: 'player.test.v1',
} as const;

export type PlayerSubject =
  (typeof PlayerSubjects)[keyof typeof PlayerSubjects];
