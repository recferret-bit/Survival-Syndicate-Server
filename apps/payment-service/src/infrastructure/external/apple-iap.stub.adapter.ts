import { Injectable } from '@nestjs/common';
import { AppleIAPPort } from '@app/payment-service/application/ports/apple-iap.port';

/**
 * Stub Apple IAP adapter. Always returns false (invalid) for template.
 * Replace with real Apple Server API validation in production.
 */
@Injectable()
export class AppleIAPStubAdapter extends AppleIAPPort {
  async validateReceipt(
    _receipt: string,
    _productId: string,
  ): Promise<boolean> {
    return false;
  }
}
