import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SyncActiveUsersCacheHandler } from '@app/users/application/use-cases/sync-active-users-cache/sync-active-users-cache.handler';
import { SyncActiveUsersCacheCommand } from '@app/users/application/use-cases/sync-active-users-cache/sync-active-users-cache.command';

@Injectable()
export class ActiveUsersCacheStartupService implements OnModuleInit {
  private readonly logger = new Logger(ActiveUsersCacheStartupService.name);

  constructor(
    private readonly syncActiveUsersCacheHandler: SyncActiveUsersCacheHandler,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Checking active users cache on startup...');
      const result = await this.syncActiveUsersCacheHandler.execute(
        new SyncActiveUsersCacheCommand(),
      );
      this.logger.log(
        `Startup cache sync completed. Total: ${result.totalUsers}, Cache: ${result.cacheSize}, Updated: ${result.updated}`,
      );
    } catch (error) {
      this.logger.error(
        `Error syncing active users cache on startup: ${error.message}`,
        error.stack,
      );
    }
  }
}
