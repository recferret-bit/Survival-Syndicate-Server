/**
 * Port for Apple IAP receipt validation.
 */
export abstract class AppleIAPPort {
  abstract validateReceipt(
    receipt: string,
    productId: string,
  ): Promise<boolean>;
}
