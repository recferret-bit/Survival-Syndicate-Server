import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GracePeriodService } from '@app/local-orchestrator/application/services/grace-period.service';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { ReconnectRequestResponseDto } from './reconnect-request.dto';
import { ReconnectRequestQuery } from './reconnect-request.query';

@QueryHandler(ReconnectRequestQuery)
export class ReconnectRequestHandler
  implements IQueryHandler<ReconnectRequestQuery>
{
  constructor(
    private readonly slotManager: SlotManagerService,
    private readonly gracePeriodService: GracePeriodService,
  ) {}

  async execute(
    query: ReconnectRequestQuery,
  ): Promise<ReconnectRequestResponseDto> {
    const status = this.slotManager.evaluateReconnect(
      query.matchId,
      query.playerId,
    );
    if (status !== 'success') {
      return { status };
    }

    this.gracePeriodService.cancel(query.matchId, query.playerId);
    this.slotManager.markConnected(query.matchId, query.playerId);
    return { status: 'success' };
  }
}
