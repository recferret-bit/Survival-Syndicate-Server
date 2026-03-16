import { Injectable } from '@nestjs/common';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { WsGatewayResult } from './ws-gateway-result.type';
import { WebsocketPublisher } from '@lib/lib-websocket';

const GRACE_PERIOD_SECONDS = 60;

type HandleDisconnectInput = {
  clientId: string;
};

@Injectable()
export class HandleDisconnectUseCase {
  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly websocketPublisher: WebsocketPublisher,
  ) {}

  execute(input: HandleDisconnectInput): WsGatewayResult {
    const info = this.connectionManager.unregister(input.clientId);
    if (!info) return {};

    void this.websocketPublisher.publishPlayerConnectionStatus({
      matchId: info.matchId,
      playerId: info.playerId,
      status: 'disconnected',
    });

    return {
      notifyClientIds: this.connectionManager.getOtherClientsInMatch(
        info.matchId,
        input.clientId,
      ),
      notifyPayload: {
        type: 'player_disconnected',
        playerId: info.playerId,
        gracePeriodSeconds: GRACE_PERIOD_SECONDS,
      },
    };
  }
}
