import { Module } from '@nestjs/common';
import { PresentationModule } from '@app/local-orchestrator/presentation/presentation.module';
import { MetricsModule } from '@lib/shared/metrics';

@Module({
  imports: [PresentationModule, MetricsModule],
})
export class AppModule {}
