import { Module } from '@nestjs/common';
import { GetUserBalanceHandler } from '@app/users-service/application/use-cases/get-user-balance/get-user-balance.handler';
import { CreateUserBalanceHandler } from '@app/users-service/application/use-cases/create-user-balance/create-user-balance.handler';
import { AddBalanceEntryHandler } from '@app/users-service/application/use-cases/add-balance-entry/add-balance-entry.handler';
import { RecalculateBalanceHandler } from '@app/users-service/application/use-cases/recalculate-balance/recalculate-balance.handler';
import { IncreaseFiatBalanceHandler } from '@app/users-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.handler';
import { InfrastructureModule } from '@app/users-service/infrastructure/infrastructure.module';
import { RegisterHandler } from '@app/users-service/application/use-cases/register/register.handler';
import { LoginHandler } from '@app/users-service/application/use-cases/login/login.handler';
import { RefreshHandler } from '@app/users-service/application/use-cases/refresh/refresh.handler';
import { LogoutHandler } from '@app/users-service/application/use-cases/logout/logout.handler';
import { TokenService } from '@app/users-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/users-service/application/services/refresh-token-store.service';
import { LibPlayerModule } from '@lib/lib-player';
import { RedisModule } from '@lib/shared';

@Module({
  imports: [InfrastructureModule, LibPlayerModule, RedisModule],
  providers: [
    GetUserBalanceHandler,
    CreateUserBalanceHandler,
    AddBalanceEntryHandler,
    RecalculateBalanceHandler,
    IncreaseFiatBalanceHandler,
    RegisterHandler,
    LoginHandler,
    RefreshHandler,
    LogoutHandler,
    TokenService,
    RefreshTokenStoreService,
  ],
  exports: [
    GetUserBalanceHandler,
    CreateUserBalanceHandler,
    AddBalanceEntryHandler,
    RecalculateBalanceHandler,
    IncreaseFiatBalanceHandler,
    RegisterHandler,
    LoginHandler,
    RefreshHandler,
    LogoutHandler,
  ],
})
export class ApplicationModule {}
