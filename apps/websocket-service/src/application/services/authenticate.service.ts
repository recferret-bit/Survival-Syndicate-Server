import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthJwtService } from '@lib/shared/auth';
import { GameServerPublisher } from '@lib/lib-game-server';

export type AuthenticateInput = {
  token: string;
  matchId: string;
};

export type AuthenticateResult =
  | { success: true; playerId: string; matchId: string }
  | { success: false; code: string };

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
      return { success: false, code: response.status };
    }
    return {
      success: true,
      playerId,
      matchId: input.matchId,
    };
  }
}
