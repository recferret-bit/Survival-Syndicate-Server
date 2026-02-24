import { Admin } from '@app/users/domain/entities/admin/admin';
import BigNumber from 'bignumber.js';

export abstract class AdminPortRepository {
  abstract findByApiKey(apiKey: string): Promise<Admin | null>;

  abstract findById(id: BigNumber): Promise<Admin | null>;

  abstract findByEmail(email: string): Promise<Admin | null>;
}
