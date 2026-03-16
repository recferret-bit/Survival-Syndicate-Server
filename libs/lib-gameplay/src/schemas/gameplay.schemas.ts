import { z } from 'zod';

/**
 * Zod validation schemas for Gameplay service
 */

export const MatchFinishedEventSchema = z.object({
  matchId: z.string().min(1),
  lobbyId: z.string().optional(),
});
export type MatchFinishedEvent = z.infer<typeof MatchFinishedEventSchema>;

export const GameplayServiceHeartbeatEventSchema = z.object({
  serviceId: z.string().min(1),
  reportedAt: z.string().datetime().optional(),
});
export type GameplayServiceHeartbeatEvent = z.infer<
  typeof GameplayServiceHeartbeatEventSchema
>;

/** Stub WorldState for MVP (no real entities) */
export const WorldStateStubSchema = z.object({
  serverTick: z.number().int().nonnegative(),
  entities_full: z.array(z.unknown()),
  events: z.array(z.unknown()),
});

export type WorldStateStub = z.infer<typeof WorldStateStubSchema>;

/**
 * Subject definitions for NATS
 */
export const GameplaySubjects = {
  MATCH_FINISHED: 'match.finished.v1',
  GAMEPLAY_SERVICE_HEARTBEAT: 'gameplay.service.heartbeat.v1',
  /** Prefix for per-match world state; full subject: gameplay.world_state.{matchId} */
  GAMEPLAY_WORLD_STATE_PREFIX: 'gameplay.world_state',
} as const;

export type GameplaySubject =
  (typeof GameplaySubjects)[keyof typeof GameplaySubjects];
