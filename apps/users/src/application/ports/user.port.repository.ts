import { User } from '@app/users/domain/entities/user/user';
import { CreateUser } from '@app/users/domain/entities/user/user.type';

export abstract class UserPortRepository {
  abstract findById(id: number): Promise<User | null>;

  abstract findByEmail(email: string): Promise<User | null>;

  abstract findByPhone(phone: string): Promise<User | null>;

  abstract findByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<User | null>;

  abstract create(data: CreateUser): Promise<User>;

  abstract update(id: number, data: Partial<CreateUser>): Promise<User>;

  abstract findAllBanned(): Promise<User[]>;

  abstract countAll(): Promise<number>;

  abstract countActive(): Promise<number>;

  abstract findAllActive(): Promise<User[]>;
}
