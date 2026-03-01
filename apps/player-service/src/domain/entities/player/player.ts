import BigNumber from 'bignumber.js';
import { ValidationException } from '@lib/shared/application';
import { Entity } from '@lib/shared';
import { PlayerProps } from './player.type';

export class Player extends Entity<PlayerProps> {
  constructor(props: PlayerProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.username || this.props.username.trim().length < 3) {
      throw new ValidationException({
        username: ['Username must be at least 3 characters.'],
      });
    }
  }

  get id(): BigNumber {
    return this.props.id;
  }

  get userId(): BigNumber {
    return this.props.userId;
  }

  get username(): string {
    return this.props.username;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
