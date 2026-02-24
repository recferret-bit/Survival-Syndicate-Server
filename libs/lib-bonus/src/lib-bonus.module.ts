import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { BonusPublisher } from './publishers/bonus.publisher';

@Module({
  imports: [
    EnvModule.forRoot(),
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [BonusPublisher],
  exports: [BonusPublisher],
})
export class LibBonusModule {}
