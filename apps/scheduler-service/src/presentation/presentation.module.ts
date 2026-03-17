import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/scheduler-service/application/application.module';
import { InfrastructureModule } from '@app/scheduler-service/infrastructure/infrastructure.module';
import { SchedulerHttpController } from './http/scheduler.http.controller';
import { SchedulerNatsController } from './nats/scheduler.nats.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [SchedulerHttpController, SchedulerNatsController],
})
export class PresentationModule {}
