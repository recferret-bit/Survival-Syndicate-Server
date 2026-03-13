import { z } from 'zod';

/**
 * Zod validation schemas for Player service
 */

export const GetPlayerRequestSchema = z.object({
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
});

export const GetPlayerResponseSchema = z.object({
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  username: z.string().min(1),
  createdAt: z.string(),
});

export type GetPlayerRequest = z.infer<typeof GetPlayerRequestSchema>;
export type GetPlayerResponse = z.infer<typeof GetPlayerResponseSchema>;

/**
 * Subject definitions for NATS
 */
export const PlayerSubjects = {
  GET_PLAYER: 'player.get.v1',
} as const;

export type PlayerSubject =
  (typeof PlayerSubjects)[keyof typeof PlayerSubjects];
