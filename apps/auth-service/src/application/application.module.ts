import { Module } from '@nestjs/common';
import { GetUserBalanceHandler } from '@app/auth-service/application/use-cases/get-user-balance/get-user-balance.handler';
import { CreateUserBalanceHandler } from '@app/auth-service/application/use-cases/create-user-balance/create-user-balance.handler';
import { AddBalanceEntryHandler } from '@app/auth-service/application/use-cases/add-balance-entry/add-balance-entry.handler';
import { RecalculateBalanceHandler } from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.handler';
import { IncreaseFiatBalanceHandler } from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.handler';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GetUserBalanceHandler,
    CreateUserBalanceHandler,
    AddBalanceEntryHandler,
    RecalculateBalanceHandler,
    IncreaseFiatBalanceHandler,
  ],
  exports: [
    GetUserBalanceHandler,
    CreateUserBalanceHandler,
    AddBalanceEntryHandler,
    RecalculateBalanceHandler,
    IncreaseFiatBalanceHandler,
  ],
})
export class ApplicationModule {}
