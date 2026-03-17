import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@lib/shared';
import { InfrastructureModule } from '@app/payment-service/infrastructure/infrastructure.module';
import { ValidatePaymentHandler } from '@app/payment-service/application/use-cases/validate-payment/validate-payment.handler';

@Module({
  imports: [AuthJwtModule, InfrastructureModule],
  providers: [ValidatePaymentHandler],
  exports: [ValidatePaymentHandler],
})
export class ApplicationModule {}
