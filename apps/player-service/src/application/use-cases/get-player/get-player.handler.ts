import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetPlayerQuery } from './get-player.query';
import { GetPlayerResponseDto } from './get-player.dto';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';

@QueryHandler(GetPlayerQuery)
export class GetPlayerHandler implements IQueryHandler<GetPlayerQuery> {
  constructor(private readonly playerRepository: PlayerPortRepository) {}

  async execute(query: GetPlayerQuery): Promise<GetPlayerResponseDto> {
    const player = await this.playerRepository.findById(query.playerId);
    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return {
      playerId: player.id.toString(),
      userId: player.userId.toString(),
      username: player.username,
      createdAt: player.createdAt.toISOString(),
    };
  }
}
