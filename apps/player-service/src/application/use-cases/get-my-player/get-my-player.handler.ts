import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetMyPlayerQuery } from './get-my-player.query';
import { GetPlayerResponseDto } from '@app/player-service/application/use-cases/get-player/get-player.dto';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';

@QueryHandler(GetMyPlayerQuery)
export class GetMyPlayerHandler implements IQueryHandler<GetMyPlayerQuery> {
  constructor(private readonly playerRepository: PlayerPortRepository) {}

  async execute(query: GetMyPlayerQuery): Promise<GetPlayerResponseDto> {
    const player = await this.playerRepository.findByUserId(query.userId);
    if (!player) {
      throw new NotFoundException('Player profile not found');
    }

    return {
      playerId: player.id.toString(),
      userId: player.userId.toString(),
      username: player.username,
      createdAt: player.createdAt.toISOString(),
    };
  }
}
