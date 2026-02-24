import { createHash } from 'crypto';
import { ZodSchema } from 'zod';
import { isString } from '@nestjs/common/utils/shared.utils';
// import { GrpcInvalidArgumentException } from '../exceptions/grpc/invalid-argument.exception';
import { DocumentBuilder } from '@nestjs/swagger';
import BigNumber from 'bignumber.js';

export class Utils {
  public static async GetHashFromPassword(secret: string, password: string) {
    return createHash('sha256')
      .update(secret + password)
      .digest('hex');
  }

  public static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (match, group) => group.toUpperCase());
  }

  public static convertKeysToCamelCase(obj: Record<string, unknown>) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [this.snakeToCamel(key)]: value,
      }),
      {},
    );
  }

  public static buildSwaggerConfig(name: string, version: string) {
    const doc = new DocumentBuilder()
      .setTitle(name)
      .setVersion(version)
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'uuidv4',
        description: `Add value like: "Bearer <access_token>", Name: "Authorization", In: header`,
      });

    return doc.build();
  }

  public static convertCurrencyUnitToCurrency(
    amount: BigNumber,
    precision = 100,
    decimalPlaces = 2,
  ): number {
    const baseCurrencyValue = amount.dividedBy(precision);
    return Number(baseCurrencyValue.toFixed(decimalPlaces));
  }

  public static convertCurrencyToCurrencyUnit(
    amount: number,
    precision = 100,
  ): BigNumber {
    return new BigNumber(Math.round(amount * precision));
  }

  public static getMessageError(e) {
    return e instanceof Error ? e.message : 'Unknown error';
  }

  public static setNodeEnv(srt: string) {
    return `${srt}-${process.env.NODE_ENV}`;
  }

  public static maskString(str: string, visibleChars = 4, maskChar = '*') {
    if (!str || str.length <= visibleChars) return str;

    const visiblePart = str.slice(-visibleChars);
    const maskedPart = maskChar.repeat(str.length - visibleChars);

    return maskedPart + visiblePart;
  }

  /**
   * Converts any object to a plain Record<string, unknown>
   * Useful for converting DTOs to plain objects for storage
   */
  public static toPlainObject<T>(obj: T): Record<string, unknown> {
    if (obj === null || obj === undefined) {
      return {};
    }
    // Use JSON serialization to ensure we get a plain object without class methods/prototypes
    return structuredClone(obj) as Record<string, unknown>;
  }
}
