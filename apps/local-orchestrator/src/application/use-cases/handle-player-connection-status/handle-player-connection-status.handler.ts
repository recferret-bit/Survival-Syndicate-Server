import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { GracePeriodService } from '@app/local-orchestrator/application/services/grace-period.service';
import { HandlePlayerConnectionStatusCommand } from './handle-player-connection-status.command';
import { LocalOrchestratorPublisher } from '@lib/lib-local-orchestrator';

@CommandHandler(HandlePlayerConnectionStatusCommand)
export class HandlePlayerConnectionStatusHandler
  implements ICommandHandler<HandlePlayerConnectionStatusCommand>
{
  constructor(
    private readonly slotManager: SlotManagerService,
    private readonly gracePeriodService: GracePeriodService,
    private readonly localOrchestratorPublisher: LocalOrchestratorPublisher,
  ) {}

  async execute(command: HandlePlayerConnectionStatusCommand): Promise<void> {
    const { matchId, playerId, status } = command.event;
    if (!this.slotManager.hasMatch(matchId)) {
      return;
    }

    if (status === 'connected') {
      this.gracePeriodService.cancel(matchId, playerId);
      this.slotManager.markConnected(matchId, playerId);
      return;
    }

    this.slotManager.markDisconnected(matchId, playerId);
    this.gracePeriodService.start(matchId, playerId, async () => {
      this.slotManager.markGraceExpired(matchId, playerId);
      await this.localOrchestratorPublisher.publishGameplayRemovePlayer({
        matchId,
        playerId,
        reason: 'grace_period_expired',
      });
    });
  }
}
