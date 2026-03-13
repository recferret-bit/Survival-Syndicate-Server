import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule, RedisModule } from '@lib/shared';
import { ApplicationModule } from '@app/player-service/application/application.module';
import { InfrastructureModule } from '@app/player-service/infrastructure/infrastructure.module';
import { PlayersHttpController } from './http/players.http.controller';
import { UsersNatsController } from './nats/users.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    RedisModule,
    AuthJwtModule,
  ],
  controllers: [PlayersHttpController, UsersNatsController],
})
export class PresentationModule {}
