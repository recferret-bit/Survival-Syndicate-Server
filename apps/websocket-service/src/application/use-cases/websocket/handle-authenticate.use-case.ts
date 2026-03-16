import { Injectable } from '@nestjs/common';
import { AuthenticateService } from '@app/websocket-service/application/services/authenticate.service';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { ClientAuthenticateSchema } from '@app/websocket-service/application/schemas/ws-messages.schema';
import { WsGatewayResult } from './ws-gateway-result.type';
import {
  WsErrorCode,
  WsErrorType,
} from '@lib/lib-websocket/enum/ws-error.enums';
import { WebsocketPublisher } from '@lib/lib-websocket';

type HandleAuthenticateInput = {
  clientId: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class HandleAuthenticateUseCase {
  constructor(
    private readonly authenticateService: AuthenticateService,
    private readonly connectionManager: ConnectionManagerService,
    private readonly websocketPublisher: WebsocketPublisher,
  ) {}

  async execute(input: HandleAuthenticateInput): Promise<WsGatewayResult> {
    const parsed = ClientAuthenticateSchema.safeParse(input.payload);
    if (!parsed.success) {
      return {
        response: {
          type: WsErrorType.Authenticate,
          code: WsErrorCode.InvalidPayload,
        },
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
          response: {
            type: WsErrorType.Authenticate,
            code: result.code,
          },
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
        status: 'connected',
      });

      return {
        response: {
          type: 'authenticate_success',
          matchId: result.matchId,
          playerId: result.playerId,
        },
      };
    } catch {
      return {
        response: {
          type: WsErrorType.Authenticate,
          code: WsErrorCode.Unauthorized,
        },
      };
    }
  }
}
