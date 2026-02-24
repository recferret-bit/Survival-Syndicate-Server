import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

// Zod schema for validation
export const AttachEmailRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform((val) => val.trim().toLowerCase()),
});

export type AttachEmailRequestDto = z.infer<typeof AttachEmailRequestSchema>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class AttachEmailHttpDto extends createZodDto(AttachEmailRequestSchema) {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  declare email: string;
}

export class AttachEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email attached successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;
}
