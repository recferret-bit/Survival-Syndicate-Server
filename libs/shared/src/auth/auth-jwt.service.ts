import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from './interface/user-session.interface';
import { EnvService } from '@lib/shared/application';

@Injectable()
export class AuthJwtService {
  private readonly jwtService: JwtService;

  constructor(envService: EnvService) {
    this.jwtService = new JwtService({
      secret: envService.get('JWT_SECRET'),
      signOptions: { expiresIn: '30d' },
    });
  }

  async verifyAsync(token: string): Promise<UserSession> {
    return this.jwtService.verifyAsync(token);
  }

  async generateToken(payload: UserSession): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
