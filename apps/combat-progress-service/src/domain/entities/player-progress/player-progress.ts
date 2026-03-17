import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { PlayerProgressProps } from './player-progress.type';

export class PlayerProgress extends Entity<PlayerProgressProps> {
  constructor(props: PlayerProgressProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
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

  get level(): number {
    return this.props.level;
  }

  get currentXp(): number {
    return this.props.currentXp;
  }

  get totalXp(): number {
    return this.props.totalXp;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
