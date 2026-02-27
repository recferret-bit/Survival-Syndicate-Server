import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { LogoutResponseDto } from './logout.dto';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { BearerTokenHashCacheService } from '@lib/shared/redis';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly authUserRepository: AuthUserPortRepository,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
    private readonly refreshTokenStore: RefreshTokenStoreService,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResponseDto> {
    const { userId } = command;
    await this.authUserRepository.updateBearerTokenHash(userId, null);
    await this.bearerTokenHashCacheService.removeBearerTokenHash(userId);
    await this.refreshTokenStore.remove(userId);
    return { success: true };
  }
}
