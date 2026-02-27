import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/local-orchestrator/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  exports: [InfrastructureModule],
})
export class ApplicationModule {}
