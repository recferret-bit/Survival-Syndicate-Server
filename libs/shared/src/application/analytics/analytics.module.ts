import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
