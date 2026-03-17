import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/combat-progress-service/application/application.module';
import { InfrastructureModule } from '@app/combat-progress-service/infrastructure/infrastructure.module';
import { CombatProgressHttpController } from './http/combat-progress.http.controller';
import { CombatProgressNatsController } from './nats/combat-progress.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [CombatProgressHttpController, CombatProgressNatsController],
})
export class PresentationModule {}
