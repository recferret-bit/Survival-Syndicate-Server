import { Entity } from '@app/player-service/domain/entities/entity';
import { ValidationException } from '@lib/shared/application';
import { AdminProps, AdminStatus } from './admin.type';
import BigNumber from 'bignumber.js';

export class Admin extends Entity<AdminProps> {
  constructor(props: AdminProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.email || this.props.email.trim().length === 0) {
      throw new ValidationException({
        email: ['Email must not be empty.'],
      });
    }

    if (!this.props.apiKey || this.props.apiKey.trim().length === 0) {
      throw new ValidationException({
        apiKey: ['API key must not be empty.'],
      });
    }

    if (!Object.values(AdminStatus).includes(this.props.status)) {
      throw new ValidationException({
        status: ['Status must be either active or inactive.'],
      });
    }
  }

  get id(): BigNumber {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get apiKey(): string {
    return this.props.apiKey;
  }

  get status(): AdminStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isActive(): boolean {
    return this.props.status === AdminStatus.active;
  }

  activate(): void {
    this.props.status = AdminStatus.active;
  }

  deactivate(): void {
    this.props.status = AdminStatus.inactive;
  }
}
