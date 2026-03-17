export type PurchasePlatform = 'apple' | 'google';

export interface PurchaseProps {
  id: string;
  characterId: string;
  productId: string;
  receipt: string;
  platform: PurchasePlatform;
  validatedAt: Date;
}

export type CreatePurchase = Omit<PurchaseProps, 'id' | 'validatedAt'> & {
  validatedAt?: Date;
};
