import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { PlayerPublisher } from './publishers/users.publisher';

@Module({
  imports: [
    EnvModule.forRoot(),
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [PlayerPublisher],
  exports: [PlayerPublisher],
})
export class LibPlayerModule {}
