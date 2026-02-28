import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NonDurable } from '@lib/shared/nats';
import { ZodError } from 'zod';
import {
  GameServerSubjects,
  MatchmakingFoundMatchEventSchema,
  PlayerConnectionStatusEventSchema,
  OrchestratorPlayerReconnectRequestSchema,
  OrchestratorPlayerReconnectResponseSchema,
  GameplayServiceHeartbeatEventSchema,
} from '@lib/lib-game-server';
import type {
  MatchmakingFoundMatchEvent,
  PlayerConnectionStatusEvent,
  OrchestratorPlayerReconnectRequest,
  OrchestratorPlayerReconnectResponse,
  GameplayServiceHeartbeatEvent,
} from '@lib/lib-game-server';
import { HandleFoundMatchCommand } from '@app/local-orchestrator/application/use-cases/handle-found-match/handle-found-match.command';
import { HandlePlayerConnectionStatusCommand } from '@app/local-orchestrator/application/use-cases/handle-player-connection-status/handle-player-connection-status.command';
import { ReconnectRequestQuery } from '@app/local-orchestrator/application/use-cases/reconnect-request/reconnect-request.query';
import { HandleGameplayHeartbeatCommand } from '@app/local-orchestrator/application/use-cases/handle-gameplay-heartbeat/handle-gameplay-heartbeat.command';

@Controller()
export class LocalOrchestratorNatsController {
  private readonly logger = new Logger(LocalOrchestratorNatsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(GameServerSubjects.MATCHMAKING_FOUND_MATCH)
  @NonDurable()
  async handleFoundMatch(
    @Payload() data: MatchmakingFoundMatchEvent,
  ): Promise<void> {
    try {
      const event = MatchmakingFoundMatchEventSchema.parse(data);
      await this.commandBus.execute(new HandleFoundMatchCommand(event));
    } catch (error) {
      this.logError('handleFoundMatch', error);
      throw error;
    }
  }

  @EventPattern(GameServerSubjects.PLAYER_CONNECTION_STATUS)
  @NonDurable()
  async handlePlayerConnectionStatus(
    @Payload() data: PlayerConnectionStatusEvent,
  ): Promise<void> {
    try {
      const event = PlayerConnectionStatusEventSchema.parse(data);
      await this.commandBus.execute(
        new HandlePlayerConnectionStatusCommand(event),
      );
    } catch (error) {
      this.logError('handlePlayerConnectionStatus', error);
      throw error;
    }
  }

  @EventPattern(GameServerSubjects.GAMEPLAY_SERVICE_HEARTBEAT)
  @NonDurable()
  async handleGameplayServiceHeartbeat(
    @Payload() data: GameplayServiceHeartbeatEvent,
  ): Promise<void> {
    try {
      const event = GameplayServiceHeartbeatEventSchema.parse(data);
      await this.commandBus.execute(new HandleGameplayHeartbeatCommand(event));
    } catch (error) {
      this.logError('handleGameplayServiceHeartbeat', error);
      throw error;
    }
  }

  @MessagePattern(GameServerSubjects.ORCHESTRATOR_PLAYER_RECONNECT_REQUEST)
  @NonDurable()
  async handleReconnectRequest(
    @Payload() data: OrchestratorPlayerReconnectRequest,
  ): Promise<OrchestratorPlayerReconnectResponse> {
    try {
      const request = OrchestratorPlayerReconnectRequestSchema.parse(data);
      const response = await this.queryBus.execute(
        new ReconnectRequestQuery(request.matchId, request.playerId),
      );
      return OrchestratorPlayerReconnectResponseSchema.parse(response);
    } catch (error) {
      this.logError('handleReconnectRequest', error);
      throw error;
    }
  }

  private logError(method: string, error: unknown): void {
    if (error instanceof ZodError) {
      this.logger.error(
        `${method} validation error: ${JSON.stringify(error.issues)}`,
      );
      return;
    }
    if (error instanceof Error) {
      this.logger.error(`${method} failed: ${error.message}`, error.stack);
      return;
    }
    this.logger.error(`${method} failed: ${String(error)}`);
  }
}
