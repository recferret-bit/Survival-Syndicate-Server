import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@app/users-service/infrastructure/infrastructure.module';
import { RegisterHandler } from '@app/users-service/application/use-cases/register/register.handler';
import { LoginHandler } from '@app/users-service/application/use-cases/login/login.handler';
import { RefreshHandler } from '@app/users-service/application/use-cases/refresh/refresh.handler';
import { LogoutHandler } from '@app/users-service/application/use-cases/logout/logout.handler';
import { TokenService } from '@app/users-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/users-service/application/services/refresh-token-store.service';
import { RedisModule } from '@lib/shared';
import { LibUsersModule } from '@lib/lib-users';

@Module({
  imports: [InfrastructureModule, LibUsersModule, RedisModule],
  providers: [
    RegisterHandler,
    LoginHandler,
    RefreshHandler,
    LogoutHandler,
    TokenService,
    RefreshTokenStoreService,
  ],
  exports: [RegisterHandler, LoginHandler, RefreshHandler, LogoutHandler],
})
export class ApplicationModule {}
