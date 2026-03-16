export type CreateAuthUser = {
  email: string;
  username: string;
  passwordHash: string;
  currencyIsoCode: string;
  languageIsoCode: string;
  country?: string;
};

export type AuthUserProps = {
  id: bigint;
  email: string;
  username: string;
  passwordHash: string;
  bearerTokenHash?: string;
  currencyIsoCode: string;
  languageIsoCode: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
};
