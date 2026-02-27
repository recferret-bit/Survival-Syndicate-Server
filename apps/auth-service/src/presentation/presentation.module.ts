import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule, RedisModule } from '@lib/shared';
import { LibPlayerModule } from '@lib/lib-player';
import { ApplicationModule } from '@app/auth-service/application/application.module';
import { InfrastructureModule } from '@app/auth-service/infrastructure/infrastructure.module';
import { BalanceHttpController } from '@app/auth-service/presentation/http/balance.http.controller';
import { BalanceAdminHttpController } from '@app/auth-service/presentation/http/admin/balance-admin.http.controller';
import { BalanceNatsController } from '@app/auth-service/presentation/nats/balance.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    RedisModule,
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
    LibPlayerModule,
  ],
  controllers: [
    BalanceHttpController,
    BalanceAdminHttpController,
    BalanceNatsController,
  ],
})
export class PresentationModule {}
