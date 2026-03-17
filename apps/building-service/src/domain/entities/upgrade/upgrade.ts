import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { UpgradeProps } from './upgrade.type';

export class Upgrade extends Entity<UpgradeProps> {
  constructor(props: UpgradeProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (this.props.toLevel <= this.props.fromLevel) {
      throw new ValidationException({
        toLevel: ['Target level must be greater than current level.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get buildingId(): string {
    return this.props.buildingId;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get fromLevel(): number {
    return this.props.fromLevel;
  }

  get toLevel(): number {
    return this.props.toLevel;
  }

  get status(): 'pending' | 'completed' {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
