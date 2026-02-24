import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { ExchangeRatePublisher } from './publishers/exchange-rate.publisher';

@Module({
  imports: [
    EnvModule.forRoot(),
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [ExchangeRatePublisher],
  exports: [ExchangeRatePublisher],
})
export class LibExchangeRateModule {}
