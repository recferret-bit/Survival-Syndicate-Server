import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { LibBuildingModule } from '@lib/lib-building';
import { LibPlayerModule } from '@lib/lib-player';
import { InfrastructureModule } from '@app/player-service/infrastructure/infrastructure.module';
import { RegisterUserHandler } from '@app/player-service/application/use-cases/register-user/register-user.handler';
import { LoginUserHandler } from '@app/player-service/application/use-cases/login-user/login-user.handler';
import { UpdateBannedUsersCacheHandler } from '@app/player-service/application/use-cases/update-banned-users-cache/update-banned-users-cache.handler';
import { SyncActiveUsersCacheHandler } from '@app/player-service/application/use-cases/sync-active-users-cache/sync-active-users-cache.handler';
import { GetProfileHandler } from '@app/player-service/application/use-cases/get-profile/get-profile.handler';
import { GetUserByIdHandler } from '@app/player-service/application/use-cases/get-user-by-id/get-user-by-id.handler';
import { ValidateAdminApiKeyHandler } from '@app/player-service/application/use-cases/validate-admin-api-key/validate-admin-api-key.handler';
import { UpdateProfileHandler } from '@app/player-service/application/use-cases/update-profile/update-profile.handler';
import { AttachEmailHandler } from '@app/player-service/application/use-cases/attach-email/attach-email.handler';
import { AttachPhoneHandler } from '@app/player-service/application/use-cases/attach-phone/attach-phone.handler';
import { ActiveUsersCacheStartupService } from '@app/player-service/infrastructure/services/active-users-cache-startup.service';
import { CreateProfileHandler } from '@app/player-service/application/use-cases/create-profile/create-profile.handler';
import { GetPlayerHandler } from '@app/player-service/application/use-cases/get-player/get-player.handler';
import { GetMyPlayerHandler } from '@app/player-service/application/use-cases/get-my-player/get-my-player.handler';

@Module({
  imports: [
    AuthJwtModule,
    InfrastructureModule,
    LibBuildingModule,
    LibPlayerModule,
  ],
  providers: [
    RegisterUserHandler,
    LoginUserHandler,
    UpdateBannedUsersCacheHandler,
    SyncActiveUsersCacheHandler,
    GetProfileHandler,
    GetUserByIdHandler,
    ValidateAdminApiKeyHandler,
    UpdateProfileHandler,
    AttachEmailHandler,
    AttachPhoneHandler,
    ActiveUsersCacheStartupService,
    CreateProfileHandler,
    GetPlayerHandler,
    GetMyPlayerHandler,
  ],
  exports: [
    RegisterUserHandler,
    LoginUserHandler,
    UpdateBannedUsersCacheHandler,
    SyncActiveUsersCacheHandler,
    GetProfileHandler,
    GetUserByIdHandler,
    ValidateAdminApiKeyHandler,
    UpdateProfileHandler,
    AttachEmailHandler,
    AttachPhoneHandler,
    CreateProfileHandler,
    GetPlayerHandler,
    GetMyPlayerHandler,
  ],
})
export class ApplicationModule {}
