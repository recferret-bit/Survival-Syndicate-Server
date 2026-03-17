import type { PurchasePlatform } from '@app/payment-service/domain/entities/purchase/purchase.type';

export class ValidatePaymentCommand {
  constructor(
    public readonly receipt: string,
    public readonly productId: string,
    public readonly platform: PurchasePlatform,
    public readonly characterId: string,
  ) {}
}
