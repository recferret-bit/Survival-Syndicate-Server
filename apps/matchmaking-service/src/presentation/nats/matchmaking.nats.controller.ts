import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { logNatsHandlerError, NonDurable } from '@lib/shared/nats';
import { UpsertZoneHeartbeatCommand } from '@app/matchmaking-service/application/use-cases/upsert-zone-heartbeat/upsert-zone-heartbeat.command';
import { HandleMatchFinishedCommand } from '@app/matchmaking-service/application/use-cases/handle-match-finished/handle-match-finished.command';
import {
  GameplaySubjects,
  type MatchFinishedEvent,
  MatchFinishedEventSchema,
} from '@lib/lib-gameplay';
import {
  LocalOrchestratorSubjects,
  type OrchestratorZoneHeartbeatEvent,
  OrchestratorZoneHeartbeatEventSchema,
} from '@lib/lib-local-orchestrator';

@Controller()
export class MatchmakingNatsController {
  private readonly logger = new Logger(MatchmakingNatsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(LocalOrchestratorSubjects.ORCHESTRATOR_ZONE_HEARTBEAT)
  @NonDurable()
  async handleZoneHeartbeat(
    @Payload() data: OrchestratorZoneHeartbeatEvent,
  ): Promise<void> {
    try {
      const event = OrchestratorZoneHeartbeatEventSchema.parse(data);
      await this.commandBus.execute(new UpsertZoneHeartbeatCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleZoneHeartbeat', error);
      throw error;
    }
  }

  @EventPattern(GameplaySubjects.MATCH_FINISHED)
  @NonDurable()
  async handleMatchFinished(
    @Payload() data: MatchFinishedEvent,
  ): Promise<void> {
    try {
      const event = MatchFinishedEventSchema.parse(data);
      await this.commandBus.execute(new HandleMatchFinishedCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleMatchFinished', error);
      throw error;
    }
  }
}
