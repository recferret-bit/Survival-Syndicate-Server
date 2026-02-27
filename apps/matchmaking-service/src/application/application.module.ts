import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/matchmaking-service/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  exports: [InfrastructureModule],
})
export class ApplicationModule {}
