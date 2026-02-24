import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';
import { Currencies } from '@lib/shared/currency/currency';
import { Languages } from '@lib/shared/language/language';

// Extract valid ISO codes from shared libraries
const validCurrencyIsoCodes = Currencies.map((c) => c.getIsoCode());
const validLanguageIsoCodes = Languages.map((l) => l.getIsoCode());

// Zod schema for validation
export const RegisterUserRequestSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        'Invalid phone number format. Use international format (e.g., +1234567890)',
      )
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must not exceed 100 characters'),
    currencyIsoCode: z
      .string()
      .min(1, 'Currency ISO code is required')
      .refine(
        (code) => validCurrencyIsoCodes.includes(code),
        () => ({
          message: `Invalid currency ISO code. Must be one of: ${validCurrencyIsoCodes.join(', ')}`,
        }),
      ),
    languageIsoCode: z
      .string()
      .min(1, 'Language ISO code is required')
      .refine(
        (code) => validLanguageIsoCodes.includes(code),
        () => ({
          message: `Invalid language ISO code. Must be one of: ${validLanguageIsoCodes.join(', ')}`,
        }),
      ),
    country: z
      .string()
      .max(3, 'Country code must be 3 characters or less')
      .optional(),
    name: z.string().max(255, 'Name must not exceed 255 characters').optional(),
    birthday: z
      .string()
      .datetime(
        'Invalid datetime format. Use ISO 8601 format (e.g., 2023-12-31T00:00:00Z)',
      )
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          const birthDate = new Date(date);
          const today = new Date();
          const minDate = new Date('1900-01-01');
          return birthDate <= today && birthDate >= minDate;
        },
        {
          message: 'Birthday must be a valid date between 1900-01-01 and today',
        },
      ),
    gaClientId: z
      .string()
      .max(255, 'GA Client ID must not exceed 255 characters')
      .optional(),
    yaClientId: z
      .string()
      .max(255, 'YA Client ID must not exceed 255 characters')
      .optional(),
    clickId: z
      .string()
      .max(255, 'Click ID must not exceed 255 characters')
      .optional(),
    utmMedium: z
      .string()
      .max(255, 'UTM Medium must not exceed 255 characters')
      .optional(),
    utmSource: z
      .string()
      .max(255, 'UTM Source must not exceed 255 characters')
      .optional(),
    utmCampaign: z
      .string()
      .max(255, 'UTM Campaign must not exceed 255 characters')
      .optional(),
    pid: z.string().max(255, 'PID must not exceed 255 characters').optional(),
    sub1: z.string().max(255, 'Sub1 must not exceed 255 characters').optional(),
    sub2: z.string().max(255, 'Sub2 must not exceed 255 characters').optional(),
    sub3: z.string().max(255, 'Sub3 must not exceed 255 characters').optional(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim().length > 0;
      const hasPhone = data.phone && data.phone.trim().length > 0;
      return hasEmail || hasPhone;
    },
    {
      message: 'Either email or phone must be provided',
      path: ['email', 'phone'],
    },
  )
  .transform((data) => ({
    ...data,
    email:
      data.email && data.email.trim().length > 0
        ? data.email.trim()
        : undefined,
    phone:
      data.phone && data.phone.trim().length > 0
        ? data.phone.trim()
        : undefined,
    name: data.name?.trim() || undefined,
    country: data.country?.trim() || undefined,
  }));

export type RegisterUserRequestDto = z.infer<typeof RegisterUserRequestSchema>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class RegisterUserHttpDto extends createZodDto(
  RegisterUserRequestSchema,
) {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  declare email: string | undefined;

  @ApiPropertyOptional({
    description: 'User phone number in international format',
    example: '+1234567890',
  })
  declare phone: string | undefined;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'SecurePassword123',
    minLength: 6,
    maxLength: 100,
  })
  declare password: string;

  @ApiProperty({
    description: `Currency ISO code. Must be one of: ${validCurrencyIsoCodes.join(', ')}`,
    enum: validCurrencyIsoCodes,
    example: validCurrencyIsoCodes[0],
  })
  declare currencyIsoCode: string;

  @ApiProperty({
    description: `Language ISO code. Must be one of: ${validLanguageIsoCodes.join(', ')}`,
    enum: validLanguageIsoCodes,
    example: validLanguageIsoCodes[0],
  })
  declare languageIsoCode: string;

  @ApiPropertyOptional({
    description: 'User country code (max 3 characters)',
    example: 'USA',
    maxLength: 3,
  })
  declare country: string | undefined;

  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
    maxLength: 255,
  })
  declare name: string | undefined;

  @ApiPropertyOptional({
    description: 'User birthday in ISO 8601 format',
    example: '1990-01-01T00:00:00Z',
  })
  declare birthday: string | undefined;

  @ApiPropertyOptional({
    description: 'Google Analytics Client ID',
    example: 'GA1.2.1234567890.1234567890',
    maxLength: 255,
  })
  declare gaClientId: string | undefined;

  @ApiPropertyOptional({
    description: 'Yandex Analytics Client ID',
    example: '1234567890.1234567890',
    maxLength: 255,
  })
  declare yaClientId: string | undefined;

  @ApiPropertyOptional({
    description: 'Click ID for tracking',
    example: 'click-123456',
    maxLength: 255,
  })
  declare clickId: string | undefined;

  @ApiPropertyOptional({
    description: 'UTM Medium parameter',
    example: 'email',
    maxLength: 255,
  })
  declare utmMedium: string | undefined;

  @ApiPropertyOptional({
    description: 'UTM Source parameter',
    example: 'newsletter',
    maxLength: 255,
  })
  declare utmSource: string | undefined;

  @ApiPropertyOptional({
    description: 'UTM Campaign parameter',
    example: 'summer-sale',
    maxLength: 255,
  })
  declare utmCampaign: string | undefined;

  @ApiPropertyOptional({
    description: 'Partner ID',
    example: 'partner-123',
    maxLength: 255,
  })
  declare pid: string | undefined;

  @ApiPropertyOptional({
    description: 'Sub parameter 1',
    example: 'sub1-value',
    maxLength: 255,
  })
  declare sub1: string | undefined;

  @ApiPropertyOptional({
    description: 'Sub parameter 2',
    example: 'sub2-value',
    maxLength: 255,
  })
  declare sub2: string | undefined;

  @ApiPropertyOptional({
    description: 'Sub parameter 3',
    example: 'sub3-value',
    maxLength: 255,
  })
  declare sub3: string | undefined;
}

class RegisterUserResponseUserDto {
  @ApiProperty({ description: 'User ID', example: '123' })
  id: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  currencyCode: string;

  @ApiProperty({ description: 'Language code', example: 'en' })
  languageCode: string;
}

export class RegisterUserResponseDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'User information',
    type: RegisterUserResponseUserDto,
  })
  user: RegisterUserResponseUserDto;
}
