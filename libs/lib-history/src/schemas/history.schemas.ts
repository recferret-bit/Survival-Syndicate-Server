import { z } from 'zod';

/**
 * Placeholder schemas for History service (phase_1_21)
 */
export const HistorySubjects = {
  GET_MATCH_HISTORY: 'history.get-match-history.v1',
} as const;

export const GetMatchHistoryRequestSchema = z.object({
  characterId: z.string().min(1),
  limit: z.number().optional(),
});

export const GetMatchHistoryResponseSchema = z.object({
  matches: z.array(z.unknown()),
});

export type GetMatchHistoryRequest = z.infer<
  typeof GetMatchHistoryRequestSchema
>;
export type GetMatchHistoryResponse = z.infer<
  typeof GetMatchHistoryResponseSchema
>;
