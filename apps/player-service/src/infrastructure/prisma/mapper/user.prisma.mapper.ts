import { Prisma } from '@prisma/meta';
import { User } from '@app/player-service/domain/entities/user/user';
import { CreateUser } from '@app/player-service/domain/entities/user/user.type';
import { BanReason } from '@app/player-service/domain/entities/user/user.type';
import { bigIntToBigNumber } from '@lib/shared';

type PrismaUserWithoutTracking = Prisma.UserGetPayload<{}>;

export class UserPrismaMapper {
  static toDomain(entity: PrismaUserWithoutTracking): User {
    return new User({
      id: bigIntToBigNumber(entity.id),
      email: entity.email || undefined,
      phone: entity.phone || undefined,
      passwordHash: entity.passwordHash,
      bearerTokenHash: entity.bearerTokenHash || undefined,
      name: entity.name || undefined,
      isTest: entity.isTest,
      banned: entity.banned,
      banReason: entity.banReason ? (entity.banReason as BanReason) : undefined,
      banComment: entity.banComment || undefined,
      banTime: entity.banTime || undefined,
      country: entity.country || undefined,
      languageIsoCode: entity.languageIsoCode,
      currencyIsoCode: entity.currencyIsoCode,
      birthday: entity.birthday || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPrisma(data: CreateUser): Prisma.UserUncheckedCreateInput {
    return {
      email: data.email || null,
      phone: data.phone || null,
      passwordHash: data.passwordHash,
      bearerTokenHash: data.bearerTokenHash || null,
      name: data.name || null,
      isTest: data.isTest,
      banned: data.banned,
      banReason: data.banReason || null,
      banComment: data.banComment || null,
      banTime: data.banTime || null,
      country: data.country || null,
      languageIsoCode: data.languageIsoCode,
      currencyIsoCode: data.currencyIsoCode,
      birthday: data.birthday || null,
    };
  }

  static toDomainList(entities: PrismaUserWithoutTracking[]): User[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
