import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const IncreaseFiatBalanceRequestSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, 'User ID must be a positive integer string'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer string'),
  operationId: z
    .string()
    .min(1)
    .optional()
    .describe(
      'Optional idempotency key - if omitted, a unique ID is generated',
    ),
});

export type IncreaseFiatBalanceRequestDto = z.infer<
  typeof IncreaseFiatBalanceRequestSchema
>;

export class IncreaseFiatBalanceHttpDto extends createZodDto(
  IncreaseFiatBalanceRequestSchema,
) {
  @ApiProperty({
    description: 'User ID as a positive integer string',
    example: '12345',
  })
  declare userId: string;

  @ApiProperty({
    description: 'Amount in smallest currency unit (e.g., cents)',
    example: '10000',
  })
  declare amount: string;

  @ApiPropertyOptional({
    description: 'Optional operation ID for idempotency',
    example: 'admin-increase-550e8400-e29b-41d4-a716-446655440000',
  })
  declare operationId?: string;
}

export class IncreaseFiatBalanceResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'ID of the created ledger entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ledgerEntryId: string;
}
