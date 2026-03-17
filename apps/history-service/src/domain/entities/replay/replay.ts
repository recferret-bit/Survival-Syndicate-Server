import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { ReplayProps } from './replay.type';

export class Replay extends Entity<ReplayProps> {
  constructor(props: ReplayProps) {
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

  get data(): Record<string, unknown> {
    return this.props.data;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
