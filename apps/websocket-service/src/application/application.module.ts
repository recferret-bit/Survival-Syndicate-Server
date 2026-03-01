import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared/auth';
import { LibGameServerModule } from '@lib/lib-game-server';
import { InfrastructureModule } from '@app/websocket-service/infrastructure/infrastructure.module';
import { ConnectionManagerService } from './services/connection-manager.service';
import { AuthenticateService } from './services/authenticate.service';

@Module({
  imports: [InfrastructureModule, AuthJwtModule, LibGameServerModule],
  providers: [ConnectionManagerService, AuthenticateService],
  exports: [ConnectionManagerService, AuthenticateService],
})
export class ApplicationModule {}
