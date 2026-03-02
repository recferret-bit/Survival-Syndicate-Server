import { Injectable } from '@nestjs/common';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { GameServerPublisher } from '@lib/lib-game-server';
import { WsGatewayResult } from './ws-gateway-result.type';

const GRACE_PERIOD_SECONDS = 60;

type HandleDisconnectInput = {
  clientId: string;
};

@Injectable()
export class HandleDisconnectUseCase {
  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  execute(input: HandleDisconnectInput): WsGatewayResult {
    const info = this.connectionManager.unregister(input.clientId);
    if (!info) return {};

    void this.gameServerPublisher.publishPlayerConnectionStatus({
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
