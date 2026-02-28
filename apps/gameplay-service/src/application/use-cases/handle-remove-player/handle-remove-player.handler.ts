import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SimulationManagerService } from '@app/gameplay-service/application/services/simulation-manager.service';
import { HandleRemovePlayerCommand } from './handle-remove-player.command';

@CommandHandler(HandleRemovePlayerCommand)
export class HandleRemovePlayerHandler
  implements ICommandHandler<HandleRemovePlayerCommand>
{
  constructor(private readonly simulationManager: SimulationManagerService) {}

  async execute(command: HandleRemovePlayerCommand): Promise<void> {
    const { matchId, playerId } = command.event;
    this.simulationManager.removePlayer(matchId, playerId);
  }
}
