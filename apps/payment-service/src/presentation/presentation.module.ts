import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthJwtModule, EnvModule } from '@lib/shared';
import { ApplicationModule } from '@app/payment-service/application/application.module';
import { InfrastructureModule } from '@app/payment-service/infrastructure/infrastructure.module';
import { PaymentHttpController } from './http/payment.http.controller';

@Module({
  imports: [
    EnvModule.forRoot(undefined, true),
    CqrsModule.forRoot(),
    ApplicationModule,
    InfrastructureModule,
    AuthJwtModule,
  ],
  controllers: [PaymentHttpController],
})
export class PresentationModule {}
