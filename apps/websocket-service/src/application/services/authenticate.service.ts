import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthJwtService } from '@lib/shared/auth';
import {
  GameServerPublisher,
  OrchestratorPlayerReconnectResponse,
} from '@lib/lib-game-server';
import { WsErrorCode } from '@app/websocket-service/application/use-cases/websocket/ws-error.enums';

export type AuthenticateInput = {
  token: string;
  matchId: string;
};

export type AuthenticateResult =
  | { success: true; playerId: string; matchId: string }
  | { success: false; code: WsErrorCode };

type OrchestratorReconnectErrorStatus = Exclude<
  OrchestratorPlayerReconnectResponse['status'],
  'success'
>;

const ORCHESTRATOR_RECONNECT_ERROR_CODE_MAP: Record<
  OrchestratorReconnectErrorStatus,
  WsErrorCode
> = {
  [WsErrorCode.SlotNotAvailable]: WsErrorCode.SlotNotAvailable,
  [WsErrorCode.GraceExpired]: WsErrorCode.GraceExpired,
  [WsErrorCode.MatchNotFound]: WsErrorCode.MatchNotFound,
};

@Injectable()
export class AuthenticateService {
  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  async authenticate(input: AuthenticateInput): Promise<AuthenticateResult> {
    let session: { id: string };
    try {
      session = await this.authJwtService.verifyAsync(input.token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const playerId = session.id;
    const response =
      await this.gameServerPublisher.requestOrchestratorPlayerReconnect({
        matchId: input.matchId,
        playerId,
      });
    if (response.status !== 'success') {
      return {
        success: false,
        code: this.mapReconnectStatusToErrorCode(response.status),
      };
    }
    return {
      success: true,
      playerId,
      matchId: input.matchId,
    };
  }

  private mapReconnectStatusToErrorCode(
    status: OrchestratorReconnectErrorStatus,
  ): WsErrorCode {
    return ORCHESTRATOR_RECONNECT_ERROR_CODE_MAP[status];
  }
}
