import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  EnvModule,
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared';
import { ApplicationModule } from '@app/gameplay-service/application/application.module';
import { InfrastructureModule } from '@app/gameplay-service/infrastructure/infrastructure.module';
import { GameplayHttpController } from './http/gameplay.http.controller';
import { GameplayNatsController } from './nats/gameplay.nats.controller';
import { GameplayWsGateway } from './websocket/ws.gateway';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  controllers: [GameplayHttpController, GameplayNatsController],
  providers: [GameplayWsGateway],
})
export class PresentationModule {}
