import { Module } from '@nestjs/common';
import { LibGameServerModule } from '@lib/lib-game-server';
import { InfrastructureModule } from '@app/gameplay-service/infrastructure/infrastructure.module';
import { SimulationManagerService } from './services/simulation-manager.service';
import { HeartbeatService } from './services/heartbeat.service';
import { HandleStartSimulationHandler } from './use-cases/handle-start-simulation/handle-start-simulation.handler';
import { HandleRemovePlayerHandler } from './use-cases/handle-remove-player/handle-remove-player.handler';

@Module({
  imports: [InfrastructureModule, LibGameServerModule],
  providers: [
    SimulationManagerService,
    HeartbeatService,
    HandleStartSimulationHandler,
    HandleRemovePlayerHandler,
  ],
  exports: [InfrastructureModule, SimulationManagerService, HeartbeatService],
})
export class ApplicationModule {}
