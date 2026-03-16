import { z } from 'zod';

/**
 * Zod validation schemas for Local Orchestrator service
 */

export const OrchestratorZoneHeartbeatEventSchema = z.object({
  zoneId: z.string().min(1),
  websocketUrl: z.string().min(1),
  reportedAt: z.string().datetime().optional(),
});
export type OrchestratorZoneHeartbeatEvent = z.infer<
  typeof OrchestratorZoneHeartbeatEventSchema
>;

export const GameplayStartSimulationEventSchema = z.object({
  matchId: z.string().min(1),
  lobbyId: z.string().optional(),
  playerIds: z
    .array(
      z.string().regex(/^\d+$/, 'Player ID must be a positive integer string'),
    )
    .min(1),
  zoneId: z.string().min(1),
});
export type GameplayStartSimulationEvent = z.infer<
  typeof GameplayStartSimulationEventSchema
>;

export const GameplayRemovePlayerEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
  reason: z.enum(['grace_period_expired']),
});
export type GameplayRemovePlayerEvent = z.infer<
  typeof GameplayRemovePlayerEventSchema
>;

/**
 * Subject definitions for NATS
 */
export const LocalOrchestratorSubjects = {
  ORCHESTRATOR_ZONE_HEARTBEAT: 'orchestrator.zone.heartbeat.v1',
  GAMEPLAY_START_SIMULATION: 'gameplay.start_simulation.v1',
  GAMEPLAY_REMOVE_PLAYER: 'gameplay.remove_player.v1',
} as const;

export type LocalOrchestratorSubject =
  (typeof LocalOrchestratorSubjects)[keyof typeof LocalOrchestratorSubjects];
