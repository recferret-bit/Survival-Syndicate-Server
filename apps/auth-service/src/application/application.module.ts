import { Module } from '@nestjs/common';
import { GetUserBalanceHandler } from '@app/auth-service/application/use-cases/get-user-balance/get-user-balance.handler';
import { CreateUserBalanceHandler } from '@app/auth-service/application/use-cases/create-user-balance/create-user-balance.handler';
import { AddBalanceEntryHandler } from '@app/auth-service/application/use-cases/add-balance-entry/add-balance-entry.handler';
import { RecalculateBalanceHandler } from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.handler';
import { IncreaseFiatBalanceHandler } from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.handler';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';
import { RegisterHandler } from '@app/auth-service/application/use-cases/register/register.handler';
import { LoginHandler } from '@app/auth-service/application/use-cases/login/login.handler';
import { RefreshHandler } from '@app/auth-service/application/use-cases/refresh/refresh.handler';
import { LogoutHandler } from '@app/auth-service/application/use-cases/logout/logout.handler';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { LibPlayerModule } from '@lib/lib-player';

@Module({
  imports: [InfrastructureModule, LibPlayerModule],
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
