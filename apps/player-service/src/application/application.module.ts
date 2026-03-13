import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { LibPlayerModule } from '@lib/lib-player';
import { InfrastructureModule } from '@app/player-service/infrastructure/infrastructure.module';
import { CreateProfileHandler } from '@app/player-service/application/use-cases/create-profile/create-profile.handler';
import { GetPlayerHandler } from '@app/player-service/application/use-cases/get-player/get-player.handler';
import { GetMyPlayerHandler } from '@app/player-service/application/use-cases/get-my-player/get-my-player.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule, LibPlayerModule],
  providers: [CreateProfileHandler, GetPlayerHandler, GetMyPlayerHandler],
  exports: [CreateProfileHandler, GetPlayerHandler, GetMyPlayerHandler],
})
export class ApplicationModule {}
