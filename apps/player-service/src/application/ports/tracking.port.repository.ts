import { Tracking } from '@app/users/domain/entities/tracking/tracking';
import { CreateTracking } from '@app/users/domain/entities/tracking/tracking.type';

export abstract class TrackingPortRepository {
  abstract findByUserId(userId: BigNumber): Promise<Tracking | null>;

  abstract create(data: CreateTracking): Promise<Tracking>;

  abstract updateLastIp(userId: BigNumber, ip: string): Promise<Tracking>;
}
