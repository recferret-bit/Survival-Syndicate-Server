import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SimulationManagerService } from '@app/gameplay-service/application/services/simulation-manager.service';
import { HandleStartSimulationCommand } from './handle-start-simulation.command';

@CommandHandler(HandleStartSimulationCommand)
export class HandleStartSimulationHandler
  implements ICommandHandler<HandleStartSimulationCommand>
{
  constructor(private readonly simulationManager: SimulationManagerService) {}

  async execute(command: HandleStartSimulationCommand): Promise<void> {
    const { matchId, playerIds } = command.event;
    this.simulationManager.create(matchId, playerIds);
  }
}
