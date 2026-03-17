import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

export const MatchHistoryDtoSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  finishedAt: z.string().datetime(),
});

export const GetMatchHistoryResponseSchema = z.object({
  matchHistory: MatchHistoryDtoSchema.nullable(),
});

export type GetMatchHistoryResponseDto = z.infer<
  typeof GetMatchHistoryResponseSchema
>;

export class GetMatchHistoryResponseHttpDto extends createZodDto(
  GetMatchHistoryResponseSchema,
) {
  @ApiProperty({ description: 'Match history or null', required: false })
  declare matchHistory: z.infer<typeof MatchHistoryDtoSchema> | null;
}
