import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NatsClientModule } from '@lib/shared';
import { LibUsersModule } from '@lib/lib-users';
import { LibGamesModule } from '@lib/lib-games';
import { ProcessApprovedTransactionsService } from '@app/cron/infrastructure/services/process-approved-transactions.service';
import { PollingTransactionsService } from '@app/cron/infrastructure/services/polling-transactions.service';
import { UpdateBannedUsersCacheService } from '@app/cron/infrastructure/services/update-banned-users-cache.service';
import { SyncActiveUsersCacheService } from '@app/cron/infrastructure/services/sync-active-users-cache.service';
import { ExpireInactiveSessionsService } from '@app/cron/infrastructure/services/expire-inactive-sessions.service';
import { KvadrixPollingService } from '@app/cron/infrastructure/services/kvadrix-polling.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NatsClientModule.forRoot({ streamName: 'payments', requestTimeout: 3000 }),
    LibUsersModule,
    LibGamesModule,
  ],
  providers: [
    ProcessApprovedTransactionsService,
    PollingTransactionsService,
    KvadrixPollingService,
    UpdateBannedUsersCacheService,
    SyncActiveUsersCacheService,
    ExpireInactiveSessionsService,
  ],
  exports: [],
})
export class InfrastructureModule {}
