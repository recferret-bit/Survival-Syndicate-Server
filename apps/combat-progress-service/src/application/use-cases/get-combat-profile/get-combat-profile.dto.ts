import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

export const PlayerProgressDtoSchema = z.object({
  level: z.number(),
  currentXp: z.number(),
  totalXp: z.number(),
});

export const BattlePassDtoSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  weaponsUnlocked: z.number(),
  passivesUnlocked: z.number(),
  activesUnlocked: z.number(),
});

export const AchievementDtoSchema = z.object({
  id: z.string(),
  achievementId: z.string(),
  completedAt: z.string().datetime(),
});

export const GetCombatProfileResponseSchema = z.object({
  characterId: z.string(),
  progress: PlayerProgressDtoSchema.optional().nullable(),
  battlePasses: z.array(BattlePassDtoSchema),
  achievements: z.array(AchievementDtoSchema),
});

export type GetCombatProfileResponseDto = z.infer<
  typeof GetCombatProfileResponseSchema
>;

export class GetCombatProfileResponseHttpDto extends createZodDto(
  GetCombatProfileResponseSchema,
) {
  @ApiProperty({ description: 'Character ID' })
  declare characterId: string;

  @ApiProperty({ description: 'Player progress', required: false })
  declare progress: z.infer<typeof PlayerProgressDtoSchema> | null;

  @ApiProperty({ description: 'Battle passes' })
  declare battlePasses: z.infer<typeof BattlePassDtoSchema>[];

  @ApiProperty({ description: 'Achievements' })
  declare achievements: z.infer<typeof AchievementDtoSchema>[];
}
