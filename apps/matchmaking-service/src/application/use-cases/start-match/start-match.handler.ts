import { randomUUID } from 'crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GameServerPublisher } from '@lib/lib-game-server';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { LobbyResponseDto } from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.dto';
import { StartMatchCommand } from './start-match.command';

@CommandHandler(StartMatchCommand)
export class StartMatchHandler implements ICommandHandler<StartMatchCommand> {
  constructor(
    private readonly lobbyRepository: LobbyPortRepository,
    private readonly zoneRegistry: ZoneRegistryPort,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  async execute(command: StartMatchCommand): Promise<LobbyResponseDto> {
    const lobby = await this.lobbyRepository.findById(command.lobbyId);
    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }
    if (!lobby.playerIds.includes(command.requestedByPlayerId)) {
      throw new ConflictException('Player is not in lobby');
    }

    const zone = await this.zoneRegistry.selectZone();
    if (!zone) {
      throw new ServiceUnavailableException('No available zones');
    }

    const matchId = randomUUID();
    lobby.start(matchId, zone);
    await this.lobbyRepository.save(lobby);

    await this.gameServerPublisher.publishMatchmakingFoundMatch({
      matchId,
      lobbyId: lobby.id,
      zoneId: zone.zoneId,
      websocketUrl: zone.websocketUrl,
      playerIds: lobby.playerIds,
    });

    return {
      lobbyId: lobby.id,
      playerIds: lobby.playerIds,
      status: lobby.status,
      matchId: lobby.matchId,
      zoneId: lobby.zoneId,
      websocketUrl: lobby.websocketUrl,
    };
  }
}
