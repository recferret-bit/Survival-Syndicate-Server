import { z } from 'zod';

/**
 * Zod validation schemas for Websocket service
 */

export const OrchestratorPlayerReconnectRequestSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
});
export type OrchestratorPlayerReconnectRequest = z.infer<
  typeof OrchestratorPlayerReconnectRequestSchema
>;

export const OrchestratorPlayerReconnectResponseSchema = z.object({
  status: z.enum([
    'success',
    'SLOT_NOT_AVAILABLE',
    'GRACE_EXPIRED',
    'MATCH_NOT_FOUND',
  ]),
});
export type OrchestratorPlayerReconnectResponse = z.infer<
  typeof OrchestratorPlayerReconnectResponseSchema
>;

export const PlayerConnectionStatusEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
  status: z.enum(['connected', 'disconnected', 'reconnected']),
});
export type PlayerConnectionStatusEvent = z.infer<
  typeof PlayerConnectionStatusEventSchema
>;

/**
 * Subject definitions for NATS
 */
export const WebsocketSubjects = {
  ORCHESTRATOR_PLAYER_RECONNECT_REQUEST:
    'orchestrator.player.reconnect_request.v1',
  PLAYER_CONNECTION_STATUS: 'player.connection.status.v1',
} as const;

export type WebsocketSubject =
  (typeof WebsocketSubjects)[keyof typeof WebsocketSubjects];
