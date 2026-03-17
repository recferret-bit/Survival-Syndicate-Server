import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/collector-service/application/application.module';
import { InfrastructureModule } from '@app/collector-service/infrastructure/infrastructure.module';
import { AnalyticsNatsController } from './nats/analytics.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    ApplicationModule,
    InfrastructureModule,
  ],
  controllers: [AnalyticsNatsController],
})
export class PresentationModule {}
