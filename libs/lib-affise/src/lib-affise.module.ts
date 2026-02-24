import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { AffisePublisher } from './publishers/affise.publisher';

@Module({
  imports: [
    EnvModule.forRoot(),
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [AffisePublisher],
  exports: [AffisePublisher],
})
export class LibAffiseModule {}
