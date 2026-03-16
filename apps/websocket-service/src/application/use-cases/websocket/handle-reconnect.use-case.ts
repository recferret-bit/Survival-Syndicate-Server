import { Injectable } from '@nestjs/common';
import { ReconnectService } from '@app/websocket-service/application/services/reconnect.service';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { LobbyStateSyncService } from '@app/websocket-service/application/services/lobby-state-sync.service';
import { ClientReconnectSchema } from '@app/websocket-service/application/schemas/ws-messages.schema';
import { WsGatewayResult } from './ws-gateway-result.type';
import {
  WsErrorCode,
  WsErrorType,
} from '@lib/lib-websocket/enum/ws-error.enums';
import { WebsocketPublisher } from '@lib/lib-websocket';

type HandleReconnectInput = {
  clientId: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class HandleReconnectUseCase {
  constructor(
    private readonly reconnectService: ReconnectService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly lobbyStateSync: LobbyStateSyncService,
    private readonly websocketPublisher: WebsocketPublisher,
  ) {}

  async execute(input: HandleReconnectInput): Promise<WsGatewayResult> {
    const parsed = ClientReconnectSchema.safeParse(input.payload);
    if (!parsed.success) {
      return {
        response: {
          type: WsErrorType.Reconnect,
          code: WsErrorCode.InvalidPayload,
        },
      };
    }

    const { token, matchId } = parsed.data;
    try {
      const result = await this.reconnectService.reconnect({ token, matchId });
      if (!result.success) {
        return {
          response: {
            type: WsErrorType.Reconnect,
            code: result.code,
          },
          closeClient: true,
        };
      }

      this.connectionManager.register(
        input.clientId,
        result.playerId,
        result.matchId,
      );
      void this.websocketPublisher.publishPlayerConnectionStatus({
        matchId: result.matchId,
        playerId: result.playerId,
        status: 'reconnected',
      });

      const lobbyState = this.lobbyStateSync.getStubState(result.matchId);
      const worldState = {
        serverTick: 0,
        serverTimestamp: Date.now(),
        entities_full: [],
        entities_delta: [],
        entities_removed: [],
      };

      return {
        response: {
          type: 'reconnect_success',
          matchId: result.matchId,
          playerId: result.playerId,
          worldState,
        },
        notifyClientIds: this.connectionManager.getOtherClientsInMatch(
          result.matchId,
          input.clientId,
        ),
        notifyPayload: {
          type: 'player_reconnected',
          playerId: result.playerId,
        },
        selfPayloads: [
          {
            type: 'lobby_state_update',
            lobbyId: lobbyState.lobbyId,
            players: lobbyState.players,
          },
        ],
      };
    } catch {
      return {
        response: {
          type: WsErrorType.Reconnect,
          code: WsErrorCode.Unauthorized,
        },
        closeClient: true,
      };
    }
  }
}
