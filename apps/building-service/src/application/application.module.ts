import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { InfrastructureModule } from '@app/building-service/infrastructure/infrastructure.module';
import { GetBuildingsHandler } from '@app/building-service/application/use-cases/get-buildings/get-buildings.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule],
  providers: [GetBuildingsHandler],
  exports: [GetBuildingsHandler],
})
export class ApplicationModule {}
