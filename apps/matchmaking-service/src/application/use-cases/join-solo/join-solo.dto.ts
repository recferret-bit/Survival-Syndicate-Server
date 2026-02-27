import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const JoinSoloRequestSchema = z.object({});

export class JoinSoloHttpDto extends createZodDto(JoinSoloRequestSchema) {}

export class JoinSoloResponseDto {
  @ApiProperty()
  matchId: string;

  @ApiProperty()
  zoneId: string;

  @ApiProperty()
  websocketUrl: string;

  @ApiProperty({ type: [String] })
  playerIds: string[];
}
