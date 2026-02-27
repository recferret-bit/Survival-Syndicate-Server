import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLobbyCommand } from './create-lobby.command';
import { LobbyResponseDto } from './create-lobby.dto';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';

@CommandHandler(CreateLobbyCommand)
export class CreateLobbyHandler implements ICommandHandler<CreateLobbyCommand> {
  constructor(private readonly lobbyRepository: LobbyPortRepository) {}

  async execute(command: CreateLobbyCommand): Promise<LobbyResponseDto> {
    const lobby = await this.lobbyRepository.create({
      ownerPlayerId: command.playerId,
      maxPlayers: command.request.maxPlayers,
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
