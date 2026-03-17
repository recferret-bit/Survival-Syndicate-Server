import { Injectable } from '@nestjs/common';
import { GooglePlayIAPPort } from '@app/payment-service/application/ports/google-play-iap.port';

/**
 * Stub Google Play IAP adapter. Always returns false (invalid) for template.
 * Replace with real Google Play API validation in production.
 */
@Injectable()
export class GooglePlayIAPStubAdapter extends GooglePlayIAPPort {
  async validateReceipt(
    _receipt: string,
    _productId: string,
  ): Promise<boolean> {
    return false;
  }
}
