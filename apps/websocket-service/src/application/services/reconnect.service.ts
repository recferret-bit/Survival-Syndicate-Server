import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthJwtService } from '@lib/shared/auth';
import { WsErrorCode } from '@lib/lib-websocket/enum/ws-error.enums';
import {
  mapReconnectStatusToErrorCode,
  WebsocketPublisher,
} from '@lib/lib-websocket';

export type ReconnectInput = {
  token: string;
  matchId: string;
};

export type ReconnectResult =
  | { success: true; playerId: string; matchId: string }
  | { success: false; code: WsErrorCode };

@Injectable()
export class ReconnectService {
  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly websocketPublisher: WebsocketPublisher,
  ) {}

  async reconnect(input: ReconnectInput): Promise<ReconnectResult> {
    let session: { id: string };
    try {
      session = await this.authJwtService.verifyAsync(input.token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const playerId = session.id;
    const response =
      await this.websocketPublisher.requestOrchestratorPlayerReconnect({
        matchId: input.matchId,
        playerId,
      });
    if (response.status !== 'success') {
      return {
        success: false,
        code: mapReconnectStatusToErrorCode(response.status),
      };
    }
    return {
      success: true,
      playerId,
      matchId: input.matchId,
    };
  }
}
