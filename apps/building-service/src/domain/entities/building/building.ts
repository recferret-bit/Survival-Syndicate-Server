import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { BuildingProps } from './building.type';

export class Building extends Entity<BuildingProps> {
  constructor(props: BuildingProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.buildingId || this.props.buildingId.trim().length === 0) {
      throw new ValidationException({
        buildingId: ['Building ID is required.'],
      });
    }
    if (this.props.level < 1) {
      throw new ValidationException({
        level: ['Level must be at least 1.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get buildingId(): string {
    return this.props.buildingId;
  }

  get level(): number {
    return this.props.level;
  }

  get slot(): number {
    return this.props.slot;
  }

  get upgradedAt(): Date {
    return this.props.upgradedAt;
  }
}
