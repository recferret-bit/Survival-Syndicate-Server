import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersPublisher } from '@lib/lib-users';

@Injectable()
export class UpdateBannedUsersCacheService {
  private readonly logger = new Logger(UpdateBannedUsersCacheService.name);

  constructor(private readonly usersPublisher: UsersPublisher) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateBannedUsersCache(): Promise<void> {
    try {
      this.logger.log('Updating banned users cache...');
      const result = await this.usersPublisher.updateBannedUsersCache({});
      this.logger.log(
        `Banned users cache updated successfully. Banned users count: ${result.bannedUsersCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating banned users cache: ${error.message}`,
        error.stack,
      );
    }
  }
}
