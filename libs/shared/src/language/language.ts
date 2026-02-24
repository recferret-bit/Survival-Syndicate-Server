import { ValidationException } from '@lib/shared/application';

export class Language {
  constructor(
    private readonly text: string,
    private readonly languageCode: string,
    private readonly isoCode: string,
    private readonly isActive: boolean,
  ) {
    if (!languageCode || languageCode.trim().length === 0) {
      throw new ValidationException({
        languageCode: ['Language code must not be empty.'],
      });
    }
    if (!isoCode || isoCode.trim().length === 0) {
      throw new ValidationException({
        isoCode: ['ISO code must not be empty.'],
      });
    }
  }

  public getText(): string {
    return this.text;
  }

  public getLanguageCode(): string {
    return this.languageCode;
  }

  public getIsoCode(): string {
    return this.isoCode;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public equals(other: Language): boolean {
    if (!Language.validateLanguage(other)) {
      return false;
    }
    return (
      this.text === other.text &&
      this.languageCode === other.languageCode &&
      this.isoCode === other.isoCode &&
      this.isActive === other.isActive
    );
  }

  static validateLanguage(language: unknown): boolean {
    return language instanceof Language;
  }
}

// Language code enum for domain usage (matches Prisma schema lowercase values)
export enum LanguageCode {
  EN = 'EN',
  BN = 'BN',
}

export const Languages = [
  new Language('English', 'EN', 'en', true),
  new Language('Bengali', 'BN', 'bn-BD', true),
];
