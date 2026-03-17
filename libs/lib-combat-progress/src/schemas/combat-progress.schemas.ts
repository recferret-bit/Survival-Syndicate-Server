import { z } from 'zod';

/**
 * Placeholder schemas for Combat Progress service (phase_1_17)
 */
export const CombatProgressSubjects = {
  GET_PROFILE: 'combat.get-profile.v1',
} as const;

export const GetProfileRequestSchema = z.object({
  characterId: z.string().min(1),
});

export const GetProfileResponseSchema = z.object({
  characterId: z.string(),
  xp: z.number(),
  level: z.number(),
});

export type GetProfileRequest = z.infer<typeof GetProfileRequestSchema>;
export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;
