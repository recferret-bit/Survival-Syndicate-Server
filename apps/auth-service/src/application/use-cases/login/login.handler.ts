import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginQuery } from './login.query';
import { LoginResponseDto } from './login.dto';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { Utils, EnvService } from '@lib/shared/application';
import { BearerTokenHashCacheService } from '@lib/shared/redis';

@QueryHandler(LoginQuery)
export class LoginHandler implements IQueryHandler<LoginQuery> {
  constructor(
    private readonly authUserRepository: AuthUserPortRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenStore: RefreshTokenStoreService,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
    private readonly envService: EnvService,
  ) {}

  async execute(query: LoginQuery): Promise<LoginResponseDto> {
    const { email, password } = query.request;
    const user = await this.authUserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordSecret =
      this.envService.get('PASSWORD_SECRET') || 'default-secret';
    const passwordHash = await Utils.GetHashFromPassword(
      passwordSecret,
      password,
    );
    if (!user.verifyPasswordHash(passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = ['user'];
    const tokens = await this.tokenService.generateTokenPair({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      roles,
    });

    const accessTokenHash = await Utils.GetHashFromPassword(
      passwordSecret,
      tokens.accessToken,
    );
    const refreshTokenHash = await Utils.GetHashFromPassword(
      passwordSecret,
      tokens.refreshToken,
    );
    await this.authUserRepository.updateBearerTokenHash(
      user.id.toString(),
      accessTokenHash,
    );
    await this.bearerTokenHashCacheService.setBearerTokenHash(
      user.id.toString(),
      accessTokenHash,
    );
    await this.refreshTokenStore.set(user.id.toString(), refreshTokenHash);

    return {
      tokens,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  }
}
