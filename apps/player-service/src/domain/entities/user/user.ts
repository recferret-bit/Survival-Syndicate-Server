import { Entity } from '@lib/shared';
import { ValidationException } from '@lib/shared/application';
import { UserProps, BanReason } from './user.type';

export class User extends Entity<UserProps> {
  constructor(props: UserProps) {
    super(props);
    this.validate();
  }

  private validate(): void {
    if (!this.props.email && !this.props.phone) {
      throw new ValidationException({
        email: ['Either email or phone must be provided.'],
        phone: ['Either email or phone must be provided.'],
      });
    }

    if (
      !this.props.passwordHash ||
      this.props.passwordHash.trim().length === 0
    ) {
      throw new ValidationException({
        passwordHash: ['Password hash must not be empty.'],
      });
    }

    if (
      !this.props.languageIsoCode ||
      this.props.languageIsoCode.trim().length === 0
    ) {
      throw new ValidationException({
        languageIsoCode: ['Language ISO code must not be empty.'],
      });
    }

    if (
      !this.props.currencyIsoCode ||
      this.props.currencyIsoCode.trim().length === 0
    ) {
      throw new ValidationException({
        currencyIsoCode: ['Currency ISO code must not be empty.'],
      });
    }
  }

  get id(): BigNumber {
    return this.props.id;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get bearerTokenHash(): string | undefined {
    return this.props.bearerTokenHash;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get isTest(): boolean {
    return this.props.isTest;
  }

  get banned(): boolean {
    return this.props.banned;
  }

  get banReason(): BanReason | undefined {
    return this.props.banReason;
  }

  get banComment(): string | undefined {
    return this.props.banComment;
  }

  get banTime(): Date | undefined {
    return this.props.banTime;
  }

  get country(): string | undefined {
    return this.props.country;
  }

  get languageIsoCode(): string {
    return this.props.languageIsoCode;
  }

  get currencyIsoCode(): string {
    return this.props.currencyIsoCode;
  }

  get birthday(): Date | undefined {
    return this.props.birthday;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain methods
  isBanned(): boolean {
    return this.props.banned;
  }

  ban(reason: BanReason, comment?: string): void {
    this.props.banned = true;
    this.props.banReason = reason;
    this.props.banComment = comment;
    this.props.banTime = new Date();
  }

  unban(): void {
    this.props.banned = false;
    this.props.banReason = undefined;
    this.props.banComment = undefined;
    this.props.banTime = undefined;
  }

  isTestUser(): boolean {
    return this.props.isTest;
  }

  setTestUser(isTest: boolean): void {
    this.props.isTest = isTest;
  }
}
