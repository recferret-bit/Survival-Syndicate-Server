import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateBannedUsersCacheCommand } from './update-banned-users-cache.command';
import { UpdateBannedUsersCacheResponseDto } from './update-banned-users-cache.dto';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import {
  BannedUsersCacheService,
  BearerTokenHashCacheService,
} from '@lib/shared/redis';

@CommandHandler(UpdateBannedUsersCacheCommand)
export class UpdateBannedUsersCacheHandler
  implements ICommandHandler<UpdateBannedUsersCacheCommand>
{
  private readonly logger = new Logger(UpdateBannedUsersCacheHandler.name);

  constructor(
    private readonly userRepository: UserPortRepository,
    private readonly bannedUsersCacheService: BannedUsersCacheService,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
  ) {}

  async execute(
    command: UpdateBannedUsersCacheCommand,
  ): Promise<UpdateBannedUsersCacheResponseDto> {
    this.logger.log('Updating banned users cache');

    try {
      // Query all banned users from database
      const bannedUsers = await this.userRepository.findAllBanned();
      this.logger.log(`Found ${bannedUsers.length} banned users`);

      const userIds = bannedUsers.map((user) => user.id.toString());

      // Update banned users cache
      await this.bannedUsersCacheService.updateCache(userIds);

      // Remove bearer token hashes for banned users from Redis
      for (const userId of userIds) {
        await this.bearerTokenHashCacheService.removeBearerTokenHash(userId);
      }

      return {
        success: true,
        bannedUsersCount: bannedUsers.length,
      };
    } catch (error) {
      this.logger.error(
        `Error updating banned users cache: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
