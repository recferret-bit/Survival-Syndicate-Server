import { z } from 'zod';

/**
 * Zod validation schemas for Matchmaking service
 */

export const MatchmakingFoundMatchEventSchema = z.object({
  matchId: z.string().min(1),
  lobbyId: z.string().optional(),
  zoneId: z.string().min(1),
  websocketUrl: z.string().min(1),
  playerIds: z
    .array(
      z.string().regex(/^\d+$/, 'Player ID must be a positive integer string'),
    )
    .min(1),
});

export type MatchmakingFoundMatchEvent = z.infer<
  typeof MatchmakingFoundMatchEventSchema
>;

/**
 * Subject definitions for NATS
 */
export const MatchmakingSubjects = {
  MATCHMAKING_FOUND_MATCH: 'matchmaking.found_match.v1',
} as const;

export type MatchmakingSubject =
  (typeof MatchmakingSubjects)[keyof typeof MatchmakingSubjects];
