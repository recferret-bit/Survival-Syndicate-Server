import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { RedisModule } from '@lib/shared/redis';
import {
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared/nats';
import { CurrencyRatePublisher } from './publishers/currency-rate.publisher';
import { CurrencyRateCacheReader } from './services/currency-rate-cache.reader';

@Module({
  imports: [
    EnvModule.forRoot(),
    RedisModule,
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  providers: [CurrencyRatePublisher, CurrencyRateCacheReader],
  exports: [CurrencyRatePublisher, CurrencyRateCacheReader],
})
export class LibCurrencyRateModule {}
