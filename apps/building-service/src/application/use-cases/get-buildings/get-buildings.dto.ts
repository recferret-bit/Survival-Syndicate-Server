import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

export const BuildingDtoSchema = z.object({
  id: z.string(),
  buildingId: z.string(),
  level: z.number(),
  slot: z.number(),
  upgradedAt: z.string().datetime(),
});

export const GetBuildingsResponseSchema = z.object({
  buildings: z.array(BuildingDtoSchema),
  totalSlots: z.number(),
  usedSlots: z.number(),
});

export type GetBuildingsResponseDto = z.infer<
  typeof GetBuildingsResponseSchema
>;

export class GetBuildingsResponseHttpDto extends createZodDto(
  GetBuildingsResponseSchema,
) {
  @ApiProperty({ description: 'List of buildings' })
  declare buildings: z.infer<typeof BuildingDtoSchema>[];

  @ApiProperty({ description: 'Total slots' })
  declare totalSlots: number;

  @ApiProperty({ description: 'Used slots' })
  declare usedSlots: number;
}
