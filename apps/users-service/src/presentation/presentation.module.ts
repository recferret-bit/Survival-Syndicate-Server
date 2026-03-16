import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule, RedisModule } from '@lib/shared';
import { ApplicationModule } from '@app/users-service/application/application.module';
import { InfrastructureModule } from '@app/users-service/infrastructure/infrastructure.module';
import { AuthHttpController } from '@app/users-service/presentation/http/auth.http.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    RedisModule,
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [AuthHttpController],
})
export class PresentationModule {}
