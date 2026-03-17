import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';

export const ValidatePaymentRequestSchema = z.object({
  receipt: z.string().min(1),
  productId: z.string().min(1),
  platform: z.enum(['apple', 'google']),
  characterId: z.string().min(1),
});

export const ValidatePaymentResponseSchema = z.object({
  valid: z.boolean(),
});

export type ValidatePaymentResponseDto = z.infer<
  typeof ValidatePaymentResponseSchema
>;

export class ValidatePaymentRequestHttpDto extends createZodDto(
  ValidatePaymentRequestSchema,
) {
  @ApiProperty({ description: 'Receipt data' })
  declare receipt: string;

  @ApiProperty({ description: 'Product ID' })
  declare productId: string;

  @ApiProperty({ description: 'Platform', enum: ['apple', 'google'] })
  declare platform: 'apple' | 'google';

  @ApiProperty({ description: 'Character ID' })
  declare characterId: string;
}

export class ValidatePaymentResponseHttpDto extends createZodDto(
  ValidatePaymentResponseSchema,
) {
  @ApiProperty({ description: 'Whether the receipt is valid' })
  declare valid: boolean;
}
