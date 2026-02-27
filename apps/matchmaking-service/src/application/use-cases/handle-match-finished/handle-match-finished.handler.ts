import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandleMatchFinishedCommand } from './handle-match-finished.command';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';

@CommandHandler(HandleMatchFinishedCommand)
export class HandleMatchFinishedHandler
  implements ICommandHandler<HandleMatchFinishedCommand>
{
  constructor(private readonly lobbyRepository: LobbyPortRepository) {}

  async execute(command: HandleMatchFinishedCommand): Promise<void> {
    const lobbyId = command.event.lobbyId;
    if (!lobbyId) {
      return;
    }
    const lobby = await this.lobbyRepository.findById(lobbyId);
    if (!lobby) {
      return;
    }
    lobby.finish();
    await this.lobbyRepository.save(lobby);
  }
}
