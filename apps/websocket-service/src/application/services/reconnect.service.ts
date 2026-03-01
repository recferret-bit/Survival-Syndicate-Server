import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthJwtService } from '@lib/shared/auth';
import { GameServerPublisher } from '@lib/lib-game-server';

export type ReconnectInput = {
  token: string;
  matchId: string;
};

export type ReconnectResult =
  | { success: true; playerId: string; matchId: string }
  | { success: false; code: string };

@Injectable()
export class ReconnectService {
  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly gameServerPublisher: GameServerPublisher,
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
      await this.gameServerPublisher.requestOrchestratorPlayerReconnect({
        matchId: input.matchId,
        playerId,
      });
    if (response.status !== 'success') {
      return { success: false, code: response.status };
    }
    return {
      success: true,
      playerId,
      matchId: input.matchId,
    };
  }
}
