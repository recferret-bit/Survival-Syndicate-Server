import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const CreateLobbyRequestSchema = z.object({
  maxPlayers: z.number().int().min(2).max(8).default(4),
});

export type CreateLobbyRequestDto = z.infer<typeof CreateLobbyRequestSchema>;

export class CreateLobbyHttpDto extends createZodDto(CreateLobbyRequestSchema) {
  @ApiProperty({ minimum: 2, maximum: 8, default: 4 })
  declare maxPlayers: number;
}

export class LobbyResponseDto {
  @ApiProperty()
  lobbyId: string;

  @ApiProperty({ type: [String] })
  playerIds: string[];

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  matchId?: string;

  @ApiProperty({ required: false })
  zoneId?: string;

  @ApiProperty({ required: false })
  websocketUrl?: string;
}
