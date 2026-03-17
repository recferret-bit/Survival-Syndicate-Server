import { z } from 'zod';

/**
 * Zod validation schemas for Building service NATS contracts
 */

export const GetBuildingsRequestSchema = z.object({
  characterId: z.string().min(1),
});

export const GetBuildingsResponseSchema = z.object({
  buildings: z.array(
    z.object({
      id: z.string(),
      buildingId: z.string(),
      level: z.number(),
      slot: z.number(),
      upgradedAt: z.string(),
    }),
  ),
  totalSlots: z.number(),
  usedSlots: z.number(),
});

export type GetBuildingsRequest = z.infer<typeof GetBuildingsRequestSchema>;
export type GetBuildingsResponse = z.infer<typeof GetBuildingsResponseSchema>;

/**
 * NATS subject definitions for Building service
 */
export const BuildingSubjects = {
  GET_BUILDINGS: 'building.get-buildings.v1',
} as const;

export type BuildingSubject =
  (typeof BuildingSubjects)[keyof typeof BuildingSubjects];
