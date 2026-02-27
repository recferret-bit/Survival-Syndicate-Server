import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const GetPlayerRequestSchema = z.object({
  playerId: z
    .string()
    .regex(/^\d+$/, 'Player ID must be a positive integer string'),
});

export class GetPlayerResponseDto {
  @ApiProperty()
  playerId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: string;
}
