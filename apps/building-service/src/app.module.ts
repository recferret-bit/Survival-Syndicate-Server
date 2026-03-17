import { Module } from '@nestjs/common';
import { PresentationModule } from '@app/building-service/presentation/presentation.module';
import { MetricsModule } from '@lib/shared/metrics';

@Module({
  imports: [PresentationModule, MetricsModule],
})
export class AppModule {}
