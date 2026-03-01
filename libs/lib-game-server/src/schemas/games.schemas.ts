import { CurrencyCode } from '@lib/shared/currency';
import { z } from 'zod';

// Common schemas
export const EmptyResponseSchema = z.object({
  success: z.boolean().optional(),
});

// Game Event schemas
export const GameEventRequestSchema = z.object({
  gameId: z.string().min(1),
  eventType: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

export const GameEventResponseSchema = EmptyResponseSchema;

// Session Event schemas
export const SessionEventRequestSchema = z.object({
  sessionId: z.string().min(1),
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  gameId: z.string().min(1),
  eventType: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

export const SessionEventResponseSchema = EmptyResponseSchema;

// Delete Callback Old schemas
export const DeleteCallbackOldRequestSchema = z.object({
  transactionId: z.string().min(1),
  callbackType: z.string().optional(),
});

export const DeleteCallbackOldResponseSchema = EmptyResponseSchema;

// Add Callback Slotegrator schemas
export const AddCallbackSlotegratorRequestSchema = z.object({
  transactionId: z.string().min(1),
  callbackData: z.record(z.unknown()),
});

export const AddCallbackSlotegratorResponseSchema = EmptyResponseSchema;

// Add Callback Payment schemas
export const AddCallbackPaymentRequestSchema = z.object({
  transactionId: z.string().min(1),
  callbackData: z.record(z.unknown()),
});

export const AddCallbackPaymentResponseSchema = EmptyResponseSchema;

// Export inferred types
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
export type GameEventRequest = z.infer<typeof GameEventRequestSchema>;
export type GameEventResponse = z.infer<typeof GameEventResponseSchema>;
export type SessionEventRequest = z.infer<typeof SessionEventRequestSchema>;
export type SessionEventResponse = z.infer<typeof SessionEventResponseSchema>;
export type DeleteCallbackOldRequest = z.infer<
  typeof DeleteCallbackOldRequestSchema
>;
export type DeleteCallbackOldResponse = z.infer<
  typeof DeleteCallbackOldResponseSchema
>;
export type AddCallbackSlotegratorRequest = z.infer<
  typeof AddCallbackSlotegratorRequestSchema
>;
export type AddCallbackSlotegratorResponse = z.infer<
  typeof AddCallbackSlotegratorResponseSchema
>;
export type AddCallbackPaymentRequest = z.infer<
  typeof AddCallbackPaymentRequestSchema
>;
export type AddCallbackPaymentResponse = z.infer<
  typeof AddCallbackPaymentResponseSchema
>;

// Bet Placed schemas
export const BetPlacedRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  betAmount: z
    .string()
    .regex(/^\d+$/, 'Bet amount must be a positive integer string'),
  currency: z.nativeEnum(CurrencyCode),
  gameId: z.string().min(1),
});

export const BetPlacedResponseSchema = EmptyResponseSchema;

export type BetPlacedRequest = z.infer<typeof BetPlacedRequestSchema>;
export type BetPlacedResponse = z.infer<typeof BetPlacedResponseSchema>;

// Expire Inactive Sessions schemas
export const ExpireInactiveSessionsRequestSchema = z.object({
  inactivityTimeoutMs: z.number().int().positive().optional(),
});

export const ExpireInactiveSessionsResponseSchema = z.object({
  expiredCount: z.number().int().nonnegative(),
});

export type ExpireInactiveSessionsRequest = z.infer<
  typeof ExpireInactiveSessionsRequestSchema
>;
export type ExpireInactiveSessionsResponse = z.infer<
  typeof ExpireInactiveSessionsResponseSchema
>;

// Get User Stats schemas
export const GetUserStatsRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
});

export const UserStatsItemSchema = z.object({
  currency: z.string(),
  totalBets: z.string().regex(/^\d+$/),
  totalFreeSpins: z.string().regex(/^\d+$/),
  betAmount: z.string().regex(/^\d+$/),
  wagerCycleBetAmount: z.string().regex(/^\d+$/),
  winAmount: z.string().regex(/^\d+$/),
  freeSpinsWinAmount: z.string().regex(/^\d+$/),
  totalGameInits: z.string().regex(/^\d+$/),
  totalRefunds: z.string().regex(/^\d+$/),
  refundsAmount: z.string().regex(/^\d+$/),
  lastTimeActive: z.string().datetime().nullable(),
});

export const GetUserStatsResponseSchema = z.object({
  stats: z.array(UserStatsItemSchema),
});

export type GetUserStatsRequest = z.infer<typeof GetUserStatsRequestSchema>;
export type GetUserStatsResponse = z.infer<typeof GetUserStatsResponseSchema>;
export type UserStatsItem = z.infer<typeof UserStatsItemSchema>;

// Reset Wager Cycle schemas
export const ResetWagerCycleRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currency: z.string().min(1),
});

export const ResetWagerCycleResponseSchema = EmptyResponseSchema;

export type ResetWagerCycleRequest = z.infer<
  typeof ResetWagerCycleRequestSchema
>;
export type ResetWagerCycleResponse = z.infer<
  typeof ResetWagerCycleResponseSchema
>;

// Matchmaking / orchestrator integration schemas
export const OrchestratorZoneHeartbeatEventSchema = z.object({
  zoneId: z.string().min(1),
  websocketUrl: z.string().min(1),
  reportedAt: z.string().datetime().optional(),
});

export const MatchFinishedEventSchema = z.object({
  matchId: z.string().min(1),
  lobbyId: z.string().optional(),
});

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

export type OrchestratorZoneHeartbeatEvent = z.infer<
  typeof OrchestratorZoneHeartbeatEventSchema
>;
export type MatchFinishedEvent = z.infer<typeof MatchFinishedEventSchema>;
export type MatchmakingFoundMatchEvent = z.infer<
  typeof MatchmakingFoundMatchEventSchema
>;

export const GameplayServiceHeartbeatEventSchema = z.object({
  serviceId: z.string().min(1),
  reportedAt: z.string().datetime().optional(),
});

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

export const GameplayRemovePlayerEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
  reason: z.enum(['grace_period_expired']),
});

export const PlayerConnectionStatusEventSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
  status: z.enum(['connected', 'disconnected', 'reconnected']),
});

export const OrchestratorPlayerReconnectRequestSchema = z.object({
  matchId: z.string().min(1),
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
});

export const OrchestratorPlayerReconnectResponseSchema = z.object({
  status: z.enum([
    'success',
    'SLOT_NOT_AVAILABLE',
    'GRACE_EXPIRED',
    'MATCH_NOT_FOUND',
  ]),
});

export type GameplayServiceHeartbeatEvent = z.infer<
  typeof GameplayServiceHeartbeatEventSchema
>;
export type GameplayStartSimulationEvent = z.infer<
  typeof GameplayStartSimulationEventSchema
>;
export type GameplayRemovePlayerEvent = z.infer<
  typeof GameplayRemovePlayerEventSchema
>;
export type PlayerConnectionStatusEvent = z.infer<
  typeof PlayerConnectionStatusEventSchema
>;
export type OrchestratorPlayerReconnectRequest = z.infer<
  typeof OrchestratorPlayerReconnectRequestSchema
>;
export type OrchestratorPlayerReconnectResponse = z.infer<
  typeof OrchestratorPlayerReconnectResponseSchema
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
export const GameServerSubjects = {
  GAME_EVENT: 'games.event.new',
  SESSION_EVENT: 'games.session.new',
  DELETE_CALLBACK_OLD: 'games.callback.delete.old',
  ADD_CALLBACK_SLOTEGRATOR: 'games.callback.add.slotegrator',
  ADD_CALLBACK_PAYMENT: 'games.callback.add.payment',
  BET_PLACED: 'games.bet.placed.v1',
  EXPIRE_INACTIVE_SESSIONS: 'games.sessions.expire-inactive.v1',
  GET_USER_STATS: 'games.user-stats.get.v1',
  RESET_WAGER_CYCLE: 'games.wager-cycle.reset.v1',
  ORCHESTRATOR_ZONE_HEARTBEAT: 'orchestrator.zone.heartbeat.v1',
  GAMEPLAY_SERVICE_HEARTBEAT: 'gameplay.service.heartbeat.v1',
  MATCH_FINISHED: 'match.finished.v1',
  MATCHMAKING_FOUND_MATCH: 'matchmaking.found_match.v1',
  GAMEPLAY_START_SIMULATION: 'gameplay.start_simulation.v1',
  PLAYER_CONNECTION_STATUS: 'player.connection.status.v1',
  GAMEPLAY_REMOVE_PLAYER: 'gameplay.remove_player.v1',
  ORCHESTRATOR_PLAYER_RECONNECT_REQUEST:
    'orchestrator.player.reconnect_request.v1',
  /** Prefix for per-match world state; full subject: gameplay.world_state.{matchId} */
  GAMEPLAY_WORLD_STATE_PREFIX: 'gameplay.world_state',
} as const;

export type GameServerSubject =
  (typeof GameServerSubjects)[keyof typeof GameServerSubjects];
