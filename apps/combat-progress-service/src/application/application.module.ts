import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { InfrastructureModule } from '@app/combat-progress-service/infrastructure/infrastructure.module';
import { GetCombatProfileHandler } from '@app/combat-progress-service/application/use-cases/get-combat-profile/get-combat-profile.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule],
  providers: [GetCombatProfileHandler],
  exports: [GetCombatProfileHandler],
})
export class ApplicationModule {}
