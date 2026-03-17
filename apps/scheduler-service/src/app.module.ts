import { Module } from '@nestjs/common';
import { PresentationModule } from '@app/scheduler-service/presentation/presentation.module';
import { MetricsModule } from '@lib/shared/metrics';

@Module({
  imports: [PresentationModule, MetricsModule],
})
export class AppModule {}
