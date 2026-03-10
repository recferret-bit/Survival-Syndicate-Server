import { Injectable } from '@nestjs/common';
import { AuthUserPortRepository } from '@app/users-service/application/ports/auth-user.port.repository';
import { AuthUser } from '@app/users-service/domain/entities/auth-user/auth-user';
import { CreateAuthUser } from '@app/users-service/domain/entities/auth-user/auth-user.type';
import { UsersPrismaService } from '@app/users-service/infrastructure/prisma/users-prisma.service';
import { AuthUserPrismaMapper } from '@app/users-service/infrastructure/prisma/mapper/auth-user.prisma.mapper';

@Injectable()
export class AuthUserPrismaRepository extends AuthUserPortRepository {
  constructor(private readonly prisma: UsersPrismaService) {
    super();
  }

  async create(data: CreateAuthUser): Promise<AuthUser> {
    const created = await this.prisma.user.create({
      data: AuthUserPrismaMapper.toPrismaCreate(data),
    });
    return AuthUserPrismaMapper.toDomain(created);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    return AuthUserPrismaMapper.toDomain(user);
  }

  async findById(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) {
      return null;
    }
    return AuthUserPrismaMapper.toDomain(user);
  }

  async updateBearerTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { bearerTokenHash: hash },
    });
  }
}
