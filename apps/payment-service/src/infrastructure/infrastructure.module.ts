import { Module } from '@nestjs/common';
import { AppleIAPPort } from '@app/payment-service/application/ports/apple-iap.port';
import { GooglePlayIAPPort } from '@app/payment-service/application/ports/google-play-iap.port';
import { AppleIAPStubAdapter } from './external/apple-iap.stub.adapter';
import { GooglePlayIAPStubAdapter } from './external/google-play-iap.stub.adapter';

@Module({
  providers: [
    { provide: AppleIAPPort, useClass: AppleIAPStubAdapter },
    { provide: GooglePlayIAPPort, useClass: GooglePlayIAPStubAdapter },
  ],
  exports: [AppleIAPPort, GooglePlayIAPPort],
})
export class InfrastructureModule {}
