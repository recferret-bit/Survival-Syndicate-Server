import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameServerPublisher } from '@lib/lib-game-server';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { HandleFoundMatchCommand } from './handle-found-match.command';

@CommandHandler(HandleFoundMatchCommand)
export class HandleFoundMatchHandler
  implements ICommandHandler<HandleFoundMatchCommand>
{
  constructor(
    private readonly slotManager: SlotManagerService,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  async execute(command: HandleFoundMatchCommand): Promise<void> {
    const { matchId, lobbyId, playerIds, zoneId } = command.event;
    this.slotManager.initializeMatchSlots(matchId, playerIds);
    await this.gameServerPublisher.publishGameplayStartSimulation({
      matchId,
      lobbyId,
      playerIds,
      zoneId,
    });
  }
}
