import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/local-orchestrator/infrastructure/infrastructure.module';
import { LibGameServerModule } from '@lib/lib-game-server';
import { SlotManagerService } from '@app/local-orchestrator/application/services/slot-manager.service';
import { GracePeriodService } from '@app/local-orchestrator/application/services/grace-period.service';
import { HeartbeatService } from '@app/local-orchestrator/application/services/heartbeat.service';
import { HandleFoundMatchHandler } from '@app/local-orchestrator/application/use-cases/handle-found-match/handle-found-match.handler';
import { HandlePlayerConnectionStatusHandler } from '@app/local-orchestrator/application/use-cases/handle-player-connection-status/handle-player-connection-status.handler';
import { ReconnectRequestHandler } from '@app/local-orchestrator/application/use-cases/reconnect-request/reconnect-request.handler';
import { HandleGameplayHeartbeatHandler } from '@app/local-orchestrator/application/use-cases/handle-gameplay-heartbeat/handle-gameplay-heartbeat.handler';

@Module({
  imports: [InfrastructureModule, LibGameServerModule],
  providers: [
    SlotManagerService,
    GracePeriodService,
    HeartbeatService,
    HandleFoundMatchHandler,
    HandlePlayerConnectionStatusHandler,
    ReconnectRequestHandler,
    HandleGameplayHeartbeatHandler,
  ],
  exports: [
    SlotManagerService,
    GracePeriodService,
    HeartbeatService,
    HandleFoundMatchHandler,
    HandlePlayerConnectionStatusHandler,
    ReconnectRequestHandler,
    HandleGameplayHeartbeatHandler,
  ],
})
export class ApplicationModule {}
