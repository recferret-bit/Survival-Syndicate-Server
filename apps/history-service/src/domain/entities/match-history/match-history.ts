import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { MatchHistoryProps } from './match-history.type';

export class MatchHistory extends Entity<MatchHistoryProps> {
  constructor(props: MatchHistoryProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.matchId || this.props.matchId.trim().length === 0) {
      throw new ValidationException({
        matchId: ['Match ID is required.'],
      });
    }
  }

  get id(): string {
    return this.props.id;
  }

  get matchId(): string {
    return this.props.matchId;
  }

  get finishedAt(): Date {
    return this.props.finishedAt;
  }
}
