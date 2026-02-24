import { Prisma } from '@prisma/users';
import { Tracking } from '@app/users/domain/entities/tracking/tracking';
import { CreateTracking } from '@app/users/domain/entities/tracking/tracking.type';
import { bigIntToBigNumber, bigNumberToBigInt } from '@lib/shared';

type PrismaTracking = Prisma.TrackingGetPayload<{}>;

export class TrackingPrismaMapper {
  static toDomain(entity: PrismaTracking): Tracking {
    return new Tracking({
      id: entity.id,
      userId: bigIntToBigNumber(entity.userId),
      firstIp: entity.firstIp,
      lastIp: entity.lastIp,
      gaClientId: entity.gaClientId || undefined,
      yaClientId: entity.yaClientId || undefined,
      clickId: entity.clickId || undefined,
      utmMedium: entity.utmMedium || undefined,
      utmSource: entity.utmSource || undefined,
      utmCampaign: entity.utmCampaign || undefined,
      pid: entity.pid || undefined,
      sub1: entity.sub1 || undefined,
      sub2: entity.sub2 || undefined,
      sub3: entity.sub3 || undefined,
    });
  }

  static toPrisma(data: CreateTracking): Prisma.TrackingUncheckedCreateInput {
    return {
      userId: bigNumberToBigInt(data.userId),
      firstIp: data.firstIp,
      lastIp: data.lastIp,
      gaClientId: data.gaClientId || null,
      yaClientId: data.yaClientId || null,
      clickId: data.clickId || null,
      utmMedium: data.utmMedium || null,
      utmSource: data.utmSource || null,
      utmCampaign: data.utmCampaign || null,
      pid: data.pid || null,
      sub1: data.sub1 || null,
      sub2: data.sub2 || null,
      sub3: data.sub3 || null,
    };
  }

  static toDomainList(entities: PrismaTracking[]): Tracking[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
