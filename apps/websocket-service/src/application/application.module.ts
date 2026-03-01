import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared/auth';
import { LibGameServerModule } from '@lib/lib-game-server';
import { InfrastructureModule } from '@app/websocket-service/infrastructure/infrastructure.module';
import { ConnectionManagerService } from './services/connection-manager.service';
import { AuthenticateService } from './services/authenticate.service';
import { ReconnectService } from './services/reconnect.service';
import { LobbyStateSyncService } from './services/lobby-state-sync.service';

@Module({
  imports: [InfrastructureModule, AuthJwtModule, LibGameServerModule],
  providers: [
    ConnectionManagerService,
    AuthenticateService,
    ReconnectService,
    LobbyStateSyncService,
  ],
  exports: [
    ConnectionManagerService,
    AuthenticateService,
    ReconnectService,
    LobbyStateSyncService,
  ],
})
export class ApplicationModule {}
