import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { LibBalanceModule } from '@lib/lib-building';
import { LibUsersModule } from '@lib/lib-player';
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

@Module({
  imports: [
    AuthJwtModule,
    InfrastructureModule,
    LibBalanceModule,
    LibUsersModule,
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
  ],
})
export class ApplicationModule {}
