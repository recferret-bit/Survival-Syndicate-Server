import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { BattlePassProps } from './battle-pass.type';

export class BattlePass extends Entity<BattlePassProps> {
  constructor(props: BattlePassProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.seasonId || this.props.seasonId.trim().length === 0) {
      throw new ValidationException({
        seasonId: ['Season ID is required.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get characterId(): string {
    return this.props.characterId;
  }

  get seasonId(): string {
    return this.props.seasonId;
  }

  get weaponsUnlocked(): number {
    return this.props.weaponsUnlocked;
  }

  get passivesUnlocked(): number {
    return this.props.passivesUnlocked;
  }

  get activesUnlocked(): number {
    return this.props.activesUnlocked;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
