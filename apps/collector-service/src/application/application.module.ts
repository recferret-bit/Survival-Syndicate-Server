import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/collector-service/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  exports: [InfrastructureModule],
})
export class ApplicationModule {}
