import { z } from 'zod';

/**
 * Zod validation schemas for Gameplay service
 */

export const TestGameplayRequestSchema = z.object({});

export const TestGameplayResponseSchema = z.object({
  success: z.boolean(),
});

export type TestGameplayRequest = z.infer<typeof TestGameplayRequestSchema>;
export type TestGameplayResponse = z.infer<typeof TestGameplayResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const GameplaySubjects = {
  TEST: 'gameplay.test.v1',
} as const;

export type GameplaySubject =
  (typeof GameplaySubjects)[keyof typeof GameplaySubjects];
