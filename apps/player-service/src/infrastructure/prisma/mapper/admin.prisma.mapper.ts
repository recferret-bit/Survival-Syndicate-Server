import { Prisma } from '@prisma/users';
import { Admin } from '@app/users/domain/entities/admin/admin';
import { AdminStatus } from '@app/users/domain/entities/admin/admin.type';
import { bigIntToBigNumber } from '@lib/shared';

type PrismaAdmin = Prisma.AdminGetPayload<{}>;

export class AdminPrismaMapper {
  static toDomain(entity: PrismaAdmin): Admin {
    return new Admin({
      id: bigIntToBigNumber(entity.id),
      email: entity.email,
      apiKey: entity.apiKey,
      status: entity.status as AdminStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toDomainList(entities: PrismaAdmin[]): Admin[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
