import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TrackingPortRepository } from '@app/player-service/application/ports/tracking.port.repository';
import { Tracking } from '@app/player-service/domain/entities/tracking/tracking';
import { CreateTracking } from '@app/player-service/domain/entities/tracking/tracking.type';
import { TrackingPrismaMapper } from '@app/player-service/infrastructure/prisma/mapper/tracking.prisma.mapper';
import BigNumber from 'bignumber.js';
import { bigNumberToBigInt } from '@lib/shared';

@Injectable()
export class TrackingPrismaRepository extends TrackingPortRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: BigNumber): Promise<Tracking | null> {
    const userIdBigint = bigNumberToBigInt(userId);
    const entity = await this.prisma.tracking.findUnique({
      where: { userId: userIdBigint },
    });
    return entity ? TrackingPrismaMapper.toDomain(entity) : null;
  }

  async create(data: CreateTracking): Promise<Tracking> {
    const entity = await this.prisma.tracking.create({
      data: TrackingPrismaMapper.toPrisma(data),
    });
    return TrackingPrismaMapper.toDomain(entity);
  }

  async updateLastIp(userId: BigNumber, ip: string): Promise<Tracking> {
    // Use upsert to create if doesn't exist, update if it does
    const userIdBigint = bigNumberToBigInt(userId);
    const entity = await this.prisma.tracking.upsert({
      where: { userId: userIdBigint },
      update: { lastIp: ip },
      create: {
        userId: userIdBigint,
        firstIp: ip,
        lastIp: ip,
      },
    });
    return TrackingPrismaMapper.toDomain(entity);
  }
}
