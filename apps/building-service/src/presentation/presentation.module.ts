import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/building-service/application/application.module';
import { InfrastructureModule } from '@app/building-service/infrastructure/infrastructure.module';
import { BuildingHttpController } from './http/building.http.controller';
import { BuildingNatsController } from './nats/building.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [BuildingHttpController, BuildingNatsController],
})
export class PresentationModule {}
