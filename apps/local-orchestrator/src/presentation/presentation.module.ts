import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  EnvModule,
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared';
import { ApplicationModule } from '@app/local-orchestrator/application/application.module';
import { InfrastructureModule } from '@app/local-orchestrator/infrastructure/infrastructure.module';
import { LocalOrchestratorHttpController } from './http/local-orchestrator.http.controller';
import { LocalOrchestratorNatsController } from './nats/local-orchestrator.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  controllers: [
    LocalOrchestratorHttpController,
    LocalOrchestratorNatsController,
  ],
})
export class PresentationModule {}
