import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared/auth';
import { InfrastructureModule } from '@app/websocket-service/infrastructure/infrastructure.module';
import { ConnectionManagerService } from './services/connection-manager.service';
import { AuthenticateService } from './services/authenticate.service';
import { ReconnectService } from './services/reconnect.service';
import { LobbyStateSyncService } from './services/lobby-state-sync.service';
import { HandleAuthenticateUseCase } from './use-cases/websocket/handle-authenticate.use-case';
import { HandleReconnectUseCase } from './use-cases/websocket/handle-reconnect.use-case';
import { HandleDisconnectUseCase } from './use-cases/websocket/handle-disconnect.use-case';
import { HandleInputUseCase } from './use-cases/websocket/handle-input.use-case';
import { LibWebsocketModule } from '@lib/lib-websocket';

@Module({
  imports: [InfrastructureModule, AuthJwtModule, LibWebsocketModule],
  providers: [
    ConnectionManagerService,
    AuthenticateService,
    ReconnectService,
    LobbyStateSyncService,
    HandleAuthenticateUseCase,
    HandleReconnectUseCase,
    HandleDisconnectUseCase,
    HandleInputUseCase,
  ],
  exports: [
    ConnectionManagerService,
    AuthenticateService,
    ReconnectService,
    LobbyStateSyncService,
    HandleAuthenticateUseCase,
    HandleReconnectUseCase,
    HandleDisconnectUseCase,
    HandleInputUseCase,
  ],
})
export class ApplicationModule {}
