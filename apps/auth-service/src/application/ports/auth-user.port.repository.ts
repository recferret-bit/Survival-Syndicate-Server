import { AuthUser } from '@app/auth-service/domain/entities/auth-user/auth-user';
import { CreateAuthUser } from '@app/auth-service/domain/entities/auth-user/auth-user.type';

export abstract class AuthUserPortRepository {
  abstract create(data: CreateAuthUser): Promise<AuthUser>;
  abstract findByEmail(email: string): Promise<AuthUser | null>;
  abstract findById(userId: string): Promise<AuthUser | null>;
  abstract updateBearerTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void>;
}
