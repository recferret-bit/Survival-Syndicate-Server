import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  WebsocketSubjects,
  OrchestratorPlayerReconnectResponse,
  OrchestratorPlayerReconnectRequest,
  OrchestratorPlayerReconnectRequestSchema,
  OrchestratorPlayerReconnectResponseSchema,
  PlayerConnectionStatusEvent,
  PlayerConnectionStatusEventSchema,
} from '../schemas/websocket.schemas';

@Injectable()
export class WebsocketPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, WebsocketPublisher.name);
  }

  async requestOrchestratorPlayerReconnect(
    dto: OrchestratorPlayerReconnectRequest,
  ): Promise<OrchestratorPlayerReconnectResponse> {
    return this.sendNonDurable(
      WebsocketSubjects.ORCHESTRATOR_PLAYER_RECONNECT_REQUEST,
      dto,
      OrchestratorPlayerReconnectRequestSchema,
      OrchestratorPlayerReconnectResponseSchema,
    );
  }

  async publishPlayerConnectionStatus(
    dto: PlayerConnectionStatusEvent,
  ): Promise<void> {
    await this.emitDurable(
      WebsocketSubjects.PLAYER_CONNECTION_STATUS,
      dto,
      PlayerConnectionStatusEventSchema,
    );
  }
}
