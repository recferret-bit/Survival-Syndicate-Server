import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { PurchaseProps, type PurchasePlatform } from './purchase.type';

const VALID_PLATFORMS: PurchasePlatform[] = ['apple', 'google'];

export class Purchase extends Entity<PurchaseProps> {
  constructor(props: PurchaseProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (
      !this.props.platform ||
      !VALID_PLATFORMS.includes(this.props.platform)
    ) {
      throw new ValidationException({
        platform: ['Invalid platform. Must be apple or google.'],
      });
    }
    if (!this.props.productId || this.props.productId.trim().length === 0) {
      throw new ValidationException({
        productId: ['Product ID is required.'],
      });
    }
    if (!this.props.receipt || this.props.receipt.trim().length === 0) {
      throw new ValidationException({
        receipt: ['Receipt is required.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get receipt(): string {
    return this.props.receipt;
  }

  get platform(): PurchasePlatform {
    return this.props.platform;
  }

  get validatedAt(): Date {
    return this.props.validatedAt;
  }
}
