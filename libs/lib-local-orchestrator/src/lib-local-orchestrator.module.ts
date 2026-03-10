import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { LocalOrchestratorPublisher } from './publishers/local-orchestrator.publisher';

@Module({
  imports: [
    EnvModule.forRoot(),
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [LocalOrchestratorPublisher],
  exports: [LocalOrchestratorPublisher],
})
export class LibLocalOrchestratorModule {}
