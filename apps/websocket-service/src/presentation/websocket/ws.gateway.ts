import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import type { WebSocket } from 'ws';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { AuthenticateService } from '@app/websocket-service/application/services/authenticate.service';
import { GameServerPublisher } from '@lib/lib-game-server';
import { ClientAuthenticateSchema } from '@app/websocket-service/application/schemas/ws-messages.schema';

const GRACE_PERIOD_SECONDS = 60;

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsGateway.name);

  @WebSocketServer()
  server!: { clients: Set<WebSocket & { id?: string }> };

  constructor(
    private readonly connectionManager: ConnectionManagerService,
    private readonly authenticateService: AuthenticateService,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  handleConnection(client: WebSocket & { id?: string }): void {
    client.id =
      (client as unknown as { id?: string }).id ??
      `conn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: WebSocket & { id?: string }): void {
    const clientId = client.id ?? '';
    const info = this.connectionManager.unregister(clientId);
    if (info) {
      this.broadcastPlayerDisconnected(clientId, info.matchId, info.playerId);
      void this.gameServerPublisher.publishPlayerConnectionStatus({
        matchId: info.matchId,
        playerId: info.playerId,
        status: 'disconnected',
      });
    }
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string | Record<string, unknown>,
    @ConnectedSocket() client: WebSocket & { id?: string },
  ): Promise<WsResponse<Record<string, unknown>> | undefined> {
    const raw = typeof data === 'string' ? data : JSON.stringify(data ?? {});
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {
        event: 'message',
        data: { type: 'error', message: 'Invalid JSON' },
      };
    }
    const type = payload?.type as string | undefined;
    if (type === 'authenticate') {
      return this.handleAuthenticate(client, payload);
    }
    return undefined;
  }

  private async handleAuthenticate(
    client: WebSocket & { id?: string },
    payload: Record<string, unknown>,
  ): Promise<WsResponse<Record<string, unknown>>> {
    const parsed = ClientAuthenticateSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        event: 'message',
        data: { type: 'authenticate_error', code: 'INVALID_PAYLOAD' },
      };
    }
    const { token, matchId } = parsed.data;
    try {
      const result = await this.authenticateService.authenticate({
        token,
        matchId,
      });
      if (!result.success) {
        return {
          event: 'message',
          data: { type: 'authenticate_error', code: result.code },
        };
      }
      const clientId = client.id ?? '';
      this.connectionManager.register(
        clientId,
        result.playerId,
        result.matchId,
      );
      void this.gameServerPublisher.publishPlayerConnectionStatus({
        matchId: result.matchId,
        playerId: result.playerId,
        status: 'connected',
      });
      return {
        event: 'message',
        data: {
          type: 'authenticate_success',
          matchId: result.matchId,
          playerId: result.playerId,
        },
      };
    } catch {
      return {
        event: 'message',
        data: { type: 'authenticate_error', code: 'UNAUTHORIZED' },
      };
    }
  }

  private broadcastPlayerDisconnected(
    excludeClientId: string,
    matchId: string,
    playerId: string,
  ): void {
    const others = this.connectionManager.getOtherClientsInMatch(
      matchId,
      excludeClientId,
    );
    const payload = JSON.stringify({
      type: 'player_disconnected',
      playerId,
      gracePeriodSeconds: GRACE_PERIOD_SECONDS,
    });
    const clients = this.server?.clients as
      | Set<WebSocket & { id?: string }>
      | undefined;
    if (!clients) return;
    for (const ws of clients) {
      if (ws.id && others.includes(ws.id) && ws.readyState === 1) {
        ws.send(payload);
      }
    }
  }
}
