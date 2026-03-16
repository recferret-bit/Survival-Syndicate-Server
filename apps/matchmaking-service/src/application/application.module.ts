import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/matchmaking-service/infrastructure/infrastructure.module';
import { CreateLobbyHandler } from '@app/matchmaking-service/application/use-cases/create-lobby/create-lobby.handler';
import { JoinLobbyHandler } from '@app/matchmaking-service/application/use-cases/join-lobby/join-lobby.handler';
import { LeaveLobbyHandler } from '@app/matchmaking-service/application/use-cases/leave-lobby/leave-lobby.handler';
import { StartMatchHandler } from '@app/matchmaking-service/application/use-cases/start-match/start-match.handler';
import { JoinSoloHandler } from '@app/matchmaking-service/application/use-cases/join-solo/join-solo.handler';
import { UpsertZoneHeartbeatHandler } from '@app/matchmaking-service/application/use-cases/upsert-zone-heartbeat/upsert-zone-heartbeat.handler';
import { HandleMatchFinishedHandler } from '@app/matchmaking-service/application/use-cases/handle-match-finished/handle-match-finished.handler';
import { LibMatchmakingModule } from '@lib/lib-matchmaking';

@Module({
  imports: [InfrastructureModule, LibMatchmakingModule],
  providers: [
    CreateLobbyHandler,
    JoinLobbyHandler,
    LeaveLobbyHandler,
    StartMatchHandler,
    JoinSoloHandler,
    UpsertZoneHeartbeatHandler,
    HandleMatchFinishedHandler,
  ],
  exports: [
    CreateLobbyHandler,
    JoinLobbyHandler,
    LeaveLobbyHandler,
    StartMatchHandler,
    JoinSoloHandler,
    UpsertZoneHeartbeatHandler,
    HandleMatchFinishedHandler,
  ],
})
export class ApplicationModule {}
