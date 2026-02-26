import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SyncActiveUsersCacheCommand } from './sync-active-users-cache.command';
import { SyncActiveUsersCacheResponseDto } from './sync-active-users-cache.dto';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { BearerTokenHashCacheService } from '@lib/shared/redis';

@CommandHandler(SyncActiveUsersCacheCommand)
export class SyncActiveUsersCacheHandler
  implements ICommandHandler<SyncActiveUsersCacheCommand>
{
  private readonly logger = new Logger(SyncActiveUsersCacheHandler.name);

  constructor(
    private readonly userRepository: UserPortRepository,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
  ) {}

  async execute(
    command: SyncActiveUsersCacheCommand,
  ): Promise<SyncActiveUsersCacheResponseDto> {
    this.logger.log('Syncing bearer token hashes from database to Redis');

    try {
      // Get all active users with bearer token hashes
      const activeUsers = await this.userRepository.findAllActive();
      const usersWithHashes = activeUsers.filter(
        (u) => u.bearerTokenHash !== undefined && u.bearerTokenHash !== null,
      );

      this.logger.log(
        `Found ${usersWithHashes.length} active users with bearer token hashes`,
      );

      // Sync bearer token hashes to Redis
      let syncedCount = 0;
      for (const user of usersWithHashes) {
        if (user.bearerTokenHash) {
          await this.bearerTokenHashCacheService.setBearerTokenHash(
            user.id.toString(),
            user.bearerTokenHash,
          );
          syncedCount++;
        }
      }

      this.logger.log(`Synced ${syncedCount} bearer token hashes to Redis`);

      return {
        success: true,
        totalUsers: activeUsers.length,
        cacheSize: syncedCount,
        updated: syncedCount > 0,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing bearer token hashes: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
