import { Entity } from '@lib/shared';
import { AuthUserProps } from './auth-user.type';

export class AuthUser extends Entity<AuthUserProps> {
  constructor(props: AuthUserProps) {
    super(props);

    if (!props.email || !props.email.includes('@')) {
      throw new Error('Valid email is required');
    }
    if (!props.username || props.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!props.passwordHash) {
      throw new Error('Password hash is required');
    }
  }

  get id(): bigint {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get bearerTokenHash(): string | undefined {
    return this.props.bearerTokenHash;
  }

  get currencyIsoCode(): string {
    return this.props.currencyIsoCode;
  }

  get languageIsoCode(): string {
    return this.props.languageIsoCode;
  }

  get country(): string | undefined {
    return this.props.country;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  verifyPasswordHash(passwordHash: string): boolean {
    return this.props.passwordHash === passwordHash;
  }
}
