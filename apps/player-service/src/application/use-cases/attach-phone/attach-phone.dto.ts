import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

// Zod schema for validation
export const AttachPhoneRequestSchema = z.object({
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Invalid phone number format. Use international format (e.g., +1234567890)',
    )
    .transform((val) => val.trim()),
});

export type AttachPhoneRequestDto = z.infer<typeof AttachPhoneRequestSchema>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class AttachPhoneHttpDto extends createZodDto(AttachPhoneRequestSchema) {
  @ApiProperty({
    description: 'User phone number in international format',
    example: '+1234567890',
  })
  declare phone: string;
}

export class AttachPhoneResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Phone attached successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone: string;
}
