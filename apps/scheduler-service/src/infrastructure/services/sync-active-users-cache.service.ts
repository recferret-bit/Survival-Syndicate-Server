import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersPublisher } from '@lib/lib-player';

@Injectable()
export class SyncActiveUsersCacheService {
  private readonly logger = new Logger(SyncActiveUsersCacheService.name);

  constructor(private readonly usersPublisher: UsersPublisher) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncActiveUsersCache(): Promise<void> {
    try {
      this.logger.log('Syncing active users cache...');
      const result = await this.usersPublisher.syncActiveUsersCache({});
      this.logger.log(
        `Active users cache synced. Total: ${result.totalUsers}, Cache: ${result.cacheSize}, Updated: ${result.updated}`,
      );
    } catch (error) {
      this.logger.error(
        `Error syncing active users cache: ${error.message}`,
        error.stack,
      );
    }
  }
}
