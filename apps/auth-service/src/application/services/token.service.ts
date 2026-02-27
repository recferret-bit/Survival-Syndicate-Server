import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '@lib/shared/application';

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthTokenPayload = {
  id: string;
  email: string;
  username: string;
  roles: string[];
};

@Injectable()
export class TokenService {
  private readonly jwtService: JwtService;

  constructor(envService: EnvService) {
    this.jwtService = new JwtService({
      secret: envService.get('JWT_SECRET'),
    });
  }

  async generateTokenPair(payload: AuthTokenPayload): Promise<AuthTokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'access' },
      { expiresIn: '7d' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      { expiresIn: '30d' },
    );
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    const payload = await this.jwtService.verifyAsync<
      AuthTokenPayload & { tokenType?: string }
    >(token);
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      roles: payload.roles ?? ['user'],
    };
  }
}
