import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/history-service/application/application.module';
import { InfrastructureModule } from '@app/history-service/infrastructure/infrastructure.module';
import { HistoryHttpController } from './http/history.http.controller';
import { HistoryNatsController } from './nats/history.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [HistoryHttpController, HistoryNatsController],
})
export class PresentationModule {}
