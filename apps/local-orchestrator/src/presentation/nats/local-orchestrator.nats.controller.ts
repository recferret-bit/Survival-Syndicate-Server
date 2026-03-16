import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NonDurable, logNatsHandlerError } from '@lib/shared/nats';
import { HandleFoundMatchCommand } from '@app/local-orchestrator/application/use-cases/handle-found-match/handle-found-match.command';
import { HandlePlayerConnectionStatusCommand } from '@app/local-orchestrator/application/use-cases/handle-player-connection-status/handle-player-connection-status.command';
import { ReconnectRequestQuery } from '@app/local-orchestrator/application/use-cases/reconnect-request/reconnect-request.query';
import { HandleGameplayHeartbeatCommand } from '@app/local-orchestrator/application/use-cases/handle-gameplay-heartbeat/handle-gameplay-heartbeat.command';
import {
  type MatchmakingFoundMatchEvent,
  MatchmakingFoundMatchEventSchema,
  MatchmakingSubjects,
} from '@lib/lib-matchmaking';
import {
  type GameplayServiceHeartbeatEvent,
  GameplayServiceHeartbeatEventSchema,
  GameplaySubjects,
} from '@lib/lib-gameplay';
import {
  type OrchestratorPlayerReconnectRequest,
  OrchestratorPlayerReconnectRequestSchema,
  type OrchestratorPlayerReconnectResponse,
  OrchestratorPlayerReconnectResponseSchema,
  type PlayerConnectionStatusEvent,
  PlayerConnectionStatusEventSchema,
  WebsocketSubjects,
} from '@lib/lib-websocket';

@Controller()
export class LocalOrchestratorNatsController {
  private readonly logger = new Logger(LocalOrchestratorNatsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(MatchmakingSubjects.MATCHMAKING_FOUND_MATCH)
  @NonDurable()
  async handleFoundMatch(
    @Payload() data: MatchmakingFoundMatchEvent,
  ): Promise<void> {
    try {
      const event = MatchmakingFoundMatchEventSchema.parse(data);
      await this.commandBus.execute(new HandleFoundMatchCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleFoundMatch', error);
      throw error;
    }
  }

  @EventPattern(WebsocketSubjects.PLAYER_CONNECTION_STATUS)
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
      logNatsHandlerError(this.logger, 'handlePlayerConnectionStatus', error);
      throw error;
    }
  }

  @EventPattern(GameplaySubjects.GAMEPLAY_SERVICE_HEARTBEAT)
  @NonDurable()
  async handleGameplayServiceHeartbeat(
    @Payload() data: GameplayServiceHeartbeatEvent,
  ): Promise<void> {
    try {
      const event = GameplayServiceHeartbeatEventSchema.parse(data);
      await this.commandBus.execute(new HandleGameplayHeartbeatCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleGameplayServiceHeartbeat', error);
      throw error;
    }
  }

  @MessagePattern(WebsocketSubjects.ORCHESTRATOR_PLAYER_RECONNECT_REQUEST)
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
      logNatsHandlerError(this.logger, 'handleReconnectRequest', error);
      throw error;
    }
  }
}
