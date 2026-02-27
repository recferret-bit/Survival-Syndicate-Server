import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ZodError } from 'zod';
import { NonDurable } from '@lib/shared/nats';
import {
  GameServerSubjects,
  MatchFinishedEventSchema,
  OrchestratorZoneHeartbeatEventSchema,
} from '@lib/lib-game-server';
import type {
  MatchFinishedEvent,
  OrchestratorZoneHeartbeatEvent,
} from '@lib/lib-game-server';
import { UpsertZoneHeartbeatCommand } from '@app/matchmaking-service/application/use-cases/upsert-zone-heartbeat/upsert-zone-heartbeat.command';
import { HandleMatchFinishedCommand } from '@app/matchmaking-service/application/use-cases/handle-match-finished/handle-match-finished.command';

@Controller()
export class MatchmakingNatsController {
  private readonly logger = new Logger(MatchmakingNatsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GameServerSubjects.ORCHESTRATOR_ZONE_HEARTBEAT)
  @NonDurable()
  async handleZoneHeartbeat(
    @Payload() data: OrchestratorZoneHeartbeatEvent,
  ): Promise<void> {
    try {
      const event = OrchestratorZoneHeartbeatEventSchema.parse(data);
      await this.commandBus.execute(new UpsertZoneHeartbeatCommand(event));
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Invalid zone heartbeat payload: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Failed to process zone heartbeat: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  @EventPattern(GameServerSubjects.MATCH_FINISHED)
  @NonDurable()
  async handleMatchFinished(
    @Payload() data: MatchFinishedEvent,
  ): Promise<void> {
    try {
      const event = MatchFinishedEventSchema.parse(data);
      await this.commandBus.execute(new HandleMatchFinishedCommand(event));
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Invalid match finished payload: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Failed to process match finished event: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }
}
