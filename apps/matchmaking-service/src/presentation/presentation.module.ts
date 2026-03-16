import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule, RedisModule } from '@lib/shared';
import { ApplicationModule } from '@app/matchmaking-service/application/application.module';
import { InfrastructureModule } from '@app/matchmaking-service/infrastructure/infrastructure.module';
import { MatchmakingHttpController } from './http/matchmaking.http.controller';
import { MatchmakingNatsController } from './nats/matchmaking.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    RedisModule,
    AuthJwtModule,
  ],
  controllers: [MatchmakingHttpController, MatchmakingNatsController],
})
export class PresentationModule {}
