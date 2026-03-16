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
import { HandleAuthenticateUseCase } from '@app/websocket-service/application/use-cases/websocket/handle-authenticate.use-case';
import { HandleDisconnectUseCase } from '@app/websocket-service/application/use-cases/websocket/handle-disconnect.use-case';
import { HandleInputUseCase } from '@app/websocket-service/application/use-cases/websocket/handle-input.use-case';
import { HandleReconnectUseCase } from '@app/websocket-service/application/use-cases/websocket/handle-reconnect.use-case';
import { WsGatewayResult } from '@app/websocket-service/application/use-cases/websocket/ws-gateway-result.type';
import { ClientMessageType } from '@app/websocket-service/application/schemas/ws-messages.schema';
import { WsErrorType } from '@lib/lib-websocket/enum/ws-error.enums';

type WsClient = WebSocket & { id?: string };
enum WsReadyState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}
const WS_EVENT_MESSAGE = 'message';
const WS_RESPONSE_INVALID_JSON_MESSAGE = 'Invalid JSON';
const CLIENT_ID_PREFIX = 'conn';

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsGateway.name);

  @WebSocketServer()
  server!: { clients: Set<WsClient> };

  constructor(
    private readonly handleAuthenticateUseCase: HandleAuthenticateUseCase,
    private readonly handleReconnectUseCase: HandleReconnectUseCase,
    private readonly handleDisconnectUseCase: HandleDisconnectUseCase,
    private readonly handleInputUseCase: HandleInputUseCase,
  ) {}

  handleConnection(client: WsClient): void {
    client.id =
      (client as unknown as { id?: string }).id ??
      `${CLIENT_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: WsClient): void {
    const clientId = client.id ?? '';
    const result = this.handleDisconnectUseCase.execute({ clientId });
    this.dispatchResult(client, result);
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  @SubscribeMessage(WS_EVENT_MESSAGE)
  async handleMessage(
    @MessageBody() data: string | Record<string, unknown>,
    @ConnectedSocket() client: WsClient,
  ): Promise<WsResponse<Record<string, unknown>> | undefined> {
    const raw = typeof data === 'string' ? data : JSON.stringify(data ?? {});
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {
        event: WS_EVENT_MESSAGE,
        data: {
          type: WsErrorType.Generic,
          message: WS_RESPONSE_INVALID_JSON_MESSAGE,
        },
      };
    }

    const type = payload.type;
    let result: WsGatewayResult | undefined;
    switch (type) {
      case ClientMessageType.Authenticate:
        result = await this.handleAuthenticateUseCase.execute({
          clientId: client.id ?? '',
          payload,
        });
        break;
      case ClientMessageType.Reconnect:
        result = await this.handleReconnectUseCase.execute({
          clientId: client.id ?? '',
          payload,
        });
        break;
      case ClientMessageType.Input:
        result = this.handleInputUseCase.execute({
          clientId: client.id ?? '',
          payload,
        });
        break;
      default:
        result = undefined;
        break;
    }

    if (!result) return undefined;

    this.dispatchResult(client, result);
    if (!result.response) return undefined;

    return { event: WS_EVENT_MESSAGE, data: result.response };
  }

  private dispatchResult(client: WsClient, result: WsGatewayResult): void {
    if (result.notifyClientIds && result.notifyPayload) {
      this.broadcast(result.notifyClientIds, result.notifyPayload);
    }

    if (result.selfPayloads && result.selfPayloads.length > 0) {
      for (const payload of result.selfPayloads) {
        setImmediate(() => {
          this.sendIfOpen(client, payload);
        });
      }
    }

    if (result.closeClient) {
      setImmediate(() => {
        try {
          this.closeIfOpen(client);
        } catch {
          /* ignore */
        }
      });
    }
  }

  private broadcast(
    clientIds: string[],
    payload: Record<string, unknown>,
  ): void {
    const serializedPayload = JSON.stringify(payload);
    const clients = this.server?.clients as Set<WsClient> | undefined;
    if (!clients) return;

    for (const ws of clients) {
      if (ws.id && clientIds.includes(ws.id)) {
        switch (ws.readyState) {
          case WsReadyState.Open:
            ws.send(serializedPayload);
            break;
          default:
            break;
        }
      }
    }
  }

  private sendIfOpen(client: WsClient, payload: Record<string, unknown>): void {
    switch (client.readyState) {
      case WsReadyState.Open:
        client.send(JSON.stringify(payload));
        break;
      default:
        break;
    }
  }

  private closeIfOpen(client: WsClient): void {
    switch (client.readyState) {
      case WsReadyState.Open:
        client.close();
        break;
      default:
        break;
    }
  }
}
