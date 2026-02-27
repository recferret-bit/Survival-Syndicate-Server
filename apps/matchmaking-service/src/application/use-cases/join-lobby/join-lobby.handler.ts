import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { LobbyResponseDto } from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.dto';
import { JoinLobbyCommand } from './join-lobby.command';

@CommandHandler(JoinLobbyCommand)
export class JoinLobbyHandler implements ICommandHandler<JoinLobbyCommand> {
  constructor(private readonly lobbyRepository: LobbyPortRepository) {}

  async execute(command: JoinLobbyCommand): Promise<LobbyResponseDto> {
    const lobby = await this.lobbyRepository.findById(command.lobbyId);
    if (!lobby) {
      throw new NotFoundException('Lobby not found');
    }
    lobby.join(command.playerId);
    await this.lobbyRepository.save(lobby);

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
