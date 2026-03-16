import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { HandleFoundMatchCommand } from './handle-found-match.command';
import { LocalOrchestratorPublisher } from '@lib/lib-local-orchestrator';

@CommandHandler(HandleFoundMatchCommand)
export class HandleFoundMatchHandler
  implements ICommandHandler<HandleFoundMatchCommand>
{
  constructor(
    private readonly slotManager: SlotManagerService,
    private readonly localOrchestratorPublisher: LocalOrchestratorPublisher,
  ) {}

  async execute(command: HandleFoundMatchCommand): Promise<void> {
    const { matchId, lobbyId, playerIds, zoneId } = command.event;
    this.slotManager.initializeMatchSlots(matchId, playerIds);
    await this.localOrchestratorPublisher.publishGameplayStartSimulation({
      matchId,
      lobbyId,
      playerIds,
      zoneId,
    });
  }
}
