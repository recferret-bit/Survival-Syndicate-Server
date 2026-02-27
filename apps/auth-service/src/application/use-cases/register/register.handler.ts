import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { RegisterCommand } from './register.command';
import { AuthResponseDto } from './register.dto';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { Utils, EnvService } from '@lib/shared/application';
import { BearerTokenHashCacheService } from '@lib/shared/redis';
import { PlayerPublisher } from '@lib/lib-player';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly authUserRepository: AuthUserPortRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenStore: RefreshTokenStoreService,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
    private readonly playerPublisher: PlayerPublisher,
    private readonly envService: EnvService,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponseDto> {
    const { email, username, password } = command.request;
    const existing = await this.authUserRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordSecret =
      this.envService.get('PASSWORD_SECRET') || 'default-secret';
    const passwordHash = await Utils.GetHashFromPassword(
      passwordSecret,
      password,
    );
    const user = await this.authUserRepository.create({
      email,
      username,
      passwordHash,
      currencyIsoCode: 'USD',
      languageIsoCode: 'en',
    });

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

    await this.playerPublisher.publishUserRegistered({
      userId: user.id.toString(),
      currencyIsoCode: user.currencyIsoCode,
    });

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
