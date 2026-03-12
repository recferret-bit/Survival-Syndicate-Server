import { Prisma } from '@prisma/users';
import { AuthUser } from '@app/users-service/domain/entities/auth-user/auth-user';
import { CreateAuthUser } from '@app/users-service/domain/entities/auth-user/auth-user.type';

type PrismaUser = Prisma.UserGetPayload<{}>;

export class AuthUserPrismaMapper {
  static toDomain(entity: PrismaUser): AuthUser {
    return new AuthUser({
      id: entity.id,
      email: entity.email ?? '',
      username: entity.name ?? '',
      passwordHash: entity.passwordHash,
      bearerTokenHash: entity.bearerTokenHash ?? undefined,
      currencyIsoCode: entity.currencyIsoCode,
      languageIsoCode: entity.languageIsoCode,
      country: entity.country ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPrismaCreate(data: CreateAuthUser): Prisma.UserUncheckedCreateInput {
    return {
      email: data.email,
      name: data.username,
      passwordHash: data.passwordHash,
      currencyIsoCode: data.currencyIsoCode,
      languageIsoCode: data.languageIsoCode,
      country: data.country ?? null,
      isTest: false,
      banned: false,
    };
  }
}
