/**
 * Port for Google Play IAP receipt validation.
 */
export abstract class GooglePlayIAPPort {
  abstract validateReceipt(
    receipt: string,
    productId: string,
  ): Promise<boolean>;
}
