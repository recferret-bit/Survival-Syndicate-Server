import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared';
import { InfrastructureModule } from '@app/scheduler-service/infrastructure/infrastructure.module';
import { MetricsModule } from '@lib/shared/metrics';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    InfrastructureModule,
    MetricsModule,
  ],
})
export class AppModule {}
