import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { AchievementProps } from './achievement.type';

export class Achievement extends Entity<AchievementProps> {
  constructor(props: AchievementProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (
      !this.props.achievementId ||
      this.props.achievementId.trim().length === 0
    ) {
      throw new ValidationException({
        achievementId: ['Achievement ID is required.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get achievementId(): string {
    return this.props.achievementId;
  }

  get completedAt(): Date {
    return this.props.completedAt;
  }
}
