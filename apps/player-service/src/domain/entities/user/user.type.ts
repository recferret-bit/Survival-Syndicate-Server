import BigNumber from 'bignumber.js';

export enum BanReason {
  fraud = 'fraud',
  terms_violation = 'terms_violation',
  suspicious_activity = 'suspicious_activity',
  manual = 'manual',
  other = 'other',
}

export interface UserProps {
  id: BigNumber;
  email?: string;
  phone?: string;
  passwordHash: string;
  bearerTokenHash?: string;
  name?: string;
  isTest: boolean;
  banned: boolean;
  banReason?: BanReason;
  banComment?: string;
  banTime?: Date;
  country?: string;
  languageIsoCode: string;
  currencyIsoCode: string;
  birthday?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUser = Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>;
