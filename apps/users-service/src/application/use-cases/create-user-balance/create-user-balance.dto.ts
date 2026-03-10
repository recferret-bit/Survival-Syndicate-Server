import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { Currencies } from '@lib/shared/currency/currency';

// Extract valid ISO codes from shared libraries
const validCurrencyIsoCodes = Currencies.map((c) => c.getIsoCode());

// Zod schema for validation
export const CreateUserBalanceRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currencyIsoCodes: z
    .array(
      z
        .string()
        .min(1, 'Currency ISO code cannot be empty')
        .refine(
          (code) => validCurrencyIsoCodes.includes(code),
          () => ({
            message: `Invalid currency ISO code. Must be one of: ${validCurrencyIsoCodes.join(', ')}`,
          }),
        ),
    )
    .min(1, 'At least one currency ISO code is required'),
});

export type CreateUserBalanceRequestDto = z.infer<
  typeof CreateUserBalanceRequestSchema
>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class CreateUserBalanceHttpDto extends createZodDto(
  CreateUserBalanceRequestSchema,
) {
  @ApiProperty({
    description: 'User ID as a positive integer string',
    example: '12345',
  })
  declare userId: string;

  @ApiProperty({
    description: `Array of currency ISO codes. Must be one of: ${validCurrencyIsoCodes.join(', ')}`,
    enum: validCurrencyIsoCodes,
    example: [validCurrencyIsoCodes[0]],
    isArray: true,
  })
  declare currencyIsoCodes: string[];
}

export class CreateUserBalanceResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'User ID as a positive integer string',
    example: '12345',
  })
  userId: string;
}
