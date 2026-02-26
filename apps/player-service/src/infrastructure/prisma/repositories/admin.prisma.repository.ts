import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminPortRepository } from '@app/player-service/application/ports/admin.port.repository';
import { Admin } from '@app/player-service/domain/entities/admin/admin';
import { AdminPrismaMapper } from '@app/player-service/infrastructure/prisma/mapper/admin.prisma.mapper';
import BigNumber from 'bignumber.js';
import { bigNumberToBigInt } from '@lib/shared';

@Injectable()
export class AdminPrismaRepository extends AdminPortRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findByApiKey(apiKey: string): Promise<Admin | null> {
    const entity = await this.prisma.admin.findUnique({
      where: { apiKey },
    });
    return entity ? AdminPrismaMapper.toDomain(entity) : null;
  }

  async findById(id: BigNumber): Promise<Admin | null> {
    const entity = await this.prisma.admin.findUnique({
      where: { id: bigNumberToBigInt(id) },
    });
    return entity ? AdminPrismaMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const entity = await this.prisma.admin.findUnique({
      where: { email },
    });
    return entity ? AdminPrismaMapper.toDomain(entity) : null;
  }
}
