import { Entity } from '@app/users/domain/entities/entity';
import { ValidationException } from '@lib/shared/application';
import { TrackingProps } from './tracking.type';
import BigNumber from 'bignumber.js';

export class Tracking extends Entity<TrackingProps> {
  constructor(props: TrackingProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.firstIp || this.props.firstIp.trim().length === 0) {
      throw new ValidationException({
        firstIp: ['First IP must not be empty.'],
      });
    }

    if (!this.props.lastIp || this.props.lastIp.trim().length === 0) {
      throw new ValidationException({
        lastIp: ['Last IP must not be empty.'],
      });
    }

    if (!this.props.userId || this.props.userId.isLessThanOrEqualTo(0)) {
      throw new ValidationException({
        userId: ['User ID must be a positive integer.'],
      });
    }
  }

  get id(): number {
    return this.props.id;
  }

  get userId(): BigNumber {
    return this.props.userId;
  }

  get firstIp(): string {
    return this.props.firstIp;
  }

  get lastIp(): string {
    return this.props.lastIp;
  }

  get gaClientId(): string | undefined {
    return this.props.gaClientId;
  }

  get yaClientId(): string | undefined {
    return this.props.yaClientId;
  }

  get clickId(): string | undefined {
    return this.props.clickId;
  }

  get utmMedium(): string | undefined {
    return this.props.utmMedium;
  }

  get utmSource(): string | undefined {
    return this.props.utmSource;
  }

  get utmCampaign(): string | undefined {
    return this.props.utmCampaign;
  }

  get pid(): string | undefined {
    return this.props.pid;
  }

  get sub1(): string | undefined {
    return this.props.sub1;
  }

  get sub2(): string | undefined {
    return this.props.sub2;
  }

  get sub3(): string | undefined {
    return this.props.sub3;
  }

  // Domain methods
  updateLastIp(ip: string): void {
    if (!ip || ip.trim().length === 0) {
      throw new ValidationException({
        lastIp: ['IP must not be empty.'],
      });
    }
    this.props.lastIp = ip;
  }
}
