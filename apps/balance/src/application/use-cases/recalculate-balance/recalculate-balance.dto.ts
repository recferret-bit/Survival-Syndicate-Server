import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';

export const RecalculateBalanceRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  currencyType: z.nativeEnum(CurrencyType).optional(),
});

export type RecalculateBalanceRequestDto = z.infer<
  typeof RecalculateBalanceRequestSchema
>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class RecalculateBalanceHttpDto extends createZodDto(
  RecalculateBalanceRequestSchema,
) {
  @ApiProperty({
    description: 'User ID as a positive integer string',
    example: '12345',
  })
  declare userId: string;

  @ApiPropertyOptional({
    description: 'Currency type (optional)',
    enum: CurrencyType,
    example: CurrencyType.FIAT,
  })
  declare currencyType: CurrencyType | undefined;
}

export class RecalculateBalanceResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Timestamp when balance was recalculated',
    example: '2024-01-01T00:00:00.000Z',
  })
  recalculatedAt: Date;
}
