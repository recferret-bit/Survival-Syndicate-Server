import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { User } from '@app/users/domain/entities/user/user';
import { CreateUser } from '@app/users/domain/entities/user/user.type';
import { UserPrismaMapper } from '@app/users/infrastructure/prisma/mapper/user.prisma.mapper';

@Injectable()
export class UserPrismaRepository extends UserPortRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { id },
    });
    return entity ? UserPrismaMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { email },
    });
    return entity ? UserPrismaMapper.toDomain(entity) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { phone },
    });
    return entity ? UserPrismaMapper.toDomain(entity) : null;
  }

  async findByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<User | null> {
    if (email) {
      const entity = await this.prisma.user.findUnique({
        where: { email },
      });
      if (entity) return UserPrismaMapper.toDomain(entity);
    }

    if (phone) {
      const entity = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (entity) return UserPrismaMapper.toDomain(entity);
    }

    return null;
  }

  async create(data: CreateUser): Promise<User> {
    const entity = await this.prisma.user.create({
      data: UserPrismaMapper.toPrisma(data),
    });
    return UserPrismaMapper.toDomain(entity);
  }

  async update(id: number, data: Partial<CreateUser>): Promise<User> {
    const updateData: any = {};
    // Handle null/undefined for optional fields
    // For email/phone: undefined or null means clear the field (but validation will ensure at least one remains)
    // For other optional fields: undefined or null means clear the field
    if ('email' in data) {
      updateData.email =
        data.email === null || data.email === undefined || data.email === ''
          ? null
          : data.email;
    }
    if ('phone' in data) {
      updateData.phone =
        data.phone === null || data.phone === undefined || data.phone === ''
          ? null
          : data.phone;
    }
    if (data.passwordHash !== undefined)
      updateData.passwordHash = data.passwordHash;
    if (data.bearerTokenHash !== undefined) {
      updateData.bearerTokenHash =
        data.bearerTokenHash === null ||
        data.bearerTokenHash === undefined ||
        data.bearerTokenHash === ''
          ? null
          : data.bearerTokenHash;
    }
    if ('name' in data) {
      updateData.name =
        data.name === null || data.name === undefined || data.name === ''
          ? null
          : data.name;
    }
    if (data.isTest !== undefined) updateData.isTest = data.isTest;
    if (data.banned !== undefined) updateData.banned = data.banned;
    if ('banReason' in data) {
      updateData.banReason =
        data.banReason === null || data.banReason === undefined
          ? null
          : data.banReason;
    }
    if ('banComment' in data) {
      updateData.banComment =
        data.banComment === null ||
        data.banComment === undefined ||
        data.banComment === ''
          ? null
          : data.banComment;
    }
    if ('banTime' in data) {
      updateData.banTime =
        data.banTime === null || data.banTime === undefined
          ? null
          : data.banTime;
    }
    if ('country' in data) {
      updateData.country =
        data.country === null ||
        data.country === undefined ||
        data.country === ''
          ? null
          : data.country;
    }
    if (data.languageIsoCode !== undefined)
      updateData.languageIsoCode = data.languageIsoCode;
    if (data.currencyIsoCode !== undefined)
      updateData.currencyIsoCode = data.currencyIsoCode;
    if ('birthday' in data) {
      updateData.birthday =
        data.birthday === null || data.birthday === undefined
          ? null
          : data.birthday;
    }

    const entity = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return UserPrismaMapper.toDomain(entity);
  }

  async findAllBanned(): Promise<User[]> {
    const entities = await this.prisma.user.findMany({
      where: { banned: true },
    });
    return UserPrismaMapper.toDomainList(entities);
  }

  async countAll(): Promise<number> {
    return this.prisma.user.count();
  }

  async countActive(): Promise<number> {
    return this.prisma.user.count({
      where: { banned: false },
    });
  }

  async findAllActive(): Promise<User[]> {
    const entities = await this.prisma.user.findMany({
      where: { banned: false },
    });
    return UserPrismaMapper.toDomainList(entities);
  }
}
