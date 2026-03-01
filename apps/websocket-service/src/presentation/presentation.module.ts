import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  EnvModule,
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared';
import { LibGameServerModule } from '@lib/lib-game-server';
import { ApplicationModule } from '@app/websocket-service/application/application.module';
import { InfrastructureModule } from '@app/websocket-service/infrastructure/infrastructure.module';
import { WebsocketHttpController } from './http/websocket.http.controller';
import { WebsocketNatsController } from './nats/websocket.nats.controller';
import { WsGateway } from './websocket/ws.gateway';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    LibGameServerModule,
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  controllers: [WebsocketHttpController, WebsocketNatsController],
  providers: [WsGateway],
})
export class PresentationModule {}
