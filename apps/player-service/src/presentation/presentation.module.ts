import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  AuthJwtModule,
  EnvModule,
  NatsClientModule,
  DEFAULT_NATS_CLIENT_STREAM_NAME,
} from '@lib/shared';
import { ApplicationModule } from '@app/users/application/application.module';
import { InfrastructureModule } from '@app/users/infrastructure/infrastructure.module';
import { UsersHttpController } from './http/users.http.controller';
import { UsersNatsController } from './nats/users.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
    NatsClientModule.forRoot({ streamName: DEFAULT_NATS_CLIENT_STREAM_NAME }),
  ],
  controllers: [UsersHttpController, UsersNatsController],
})
export class PresentationModule {}
