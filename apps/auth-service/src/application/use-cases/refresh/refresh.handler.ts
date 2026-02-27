import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshCommand } from './refresh.command';
import { RefreshResponseDto } from './refresh.dto';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { Utils, EnvService } from '@lib/shared/application';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { BearerTokenHashCacheService } from '@lib/shared/redis';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenStore: RefreshTokenStoreService,
    private readonly authUserRepository: AuthUserPortRepository,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
    private readonly envService: EnvService,
  ) {}

  async execute(command: RefreshCommand): Promise<RefreshResponseDto> {
    const { refreshToken } = command.request;
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const passwordSecret =
      this.envService.get('PASSWORD_SECRET') || 'default-secret';
    const incomingHash = await Utils.GetHashFromPassword(
      passwordSecret,
      refreshToken,
    );

    const storedHash = await this.refreshTokenStore.get(payload.id);
    if (!storedHash || storedHash !== incomingHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.authUserRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.tokenService.generateTokenPair({
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      roles: payload.roles ?? ['user'],
    });

    const accessTokenHash = await Utils.GetHashFromPassword(
      passwordSecret,
      tokens.accessToken,
    );
    const rotatedRefreshHash = await Utils.GetHashFromPassword(
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
    await this.refreshTokenStore.set(user.id.toString(), rotatedRefreshHash);

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
