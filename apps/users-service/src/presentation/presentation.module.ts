import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule, RedisModule } from '@lib/shared';
import { LibPlayerModule } from '@lib/lib-player';
import { ApplicationModule } from '@app/users-service/application/application.module';
import { InfrastructureModule } from '@app/users-service/infrastructure/infrastructure.module';
import { BalanceHttpController } from '@app/users-service/presentation/http/balance.http.controller';
import { AuthHttpController } from '@app/users-service/presentation/http/auth.http.controller';
import { BalanceNatsController } from '@app/users-service/presentation/nats/balance.nats.controller';

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
    AuthHttpController,
    BalanceNatsController,
  ],
})
export class PresentationModule {}
