import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

// Zod schema for validation
export const LoginUserRequestSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(1),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone must be provided',
    path: ['email', 'phone'],
  });

export type LoginUserRequestDto = z.infer<typeof LoginUserRequestSchema>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class LoginUserHttpDto extends createZodDto(LoginUserRequestSchema) {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  declare email: string | undefined;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  declare phone: string | undefined;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
  })
  declare password: string;
}

export class LoginUserResponseDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', description: 'User ID', example: '123' },
      email: {
        type: 'string',
        description: 'User email address',
        example: 'user@example.com',
        nullable: true,
      },
      phone: {
        type: 'string',
        description: 'User phone number',
        example: '+1234567890',
        nullable: true,
      },
      currencyCode: {
        type: 'string',
        description: 'Currency code',
        example: 'USD',
      },
      languageCode: {
        type: 'string',
        description: 'Language code',
        example: 'en',
      },
    },
    required: ['id', 'currencyCode', 'languageCode'],
  })
  user: {
    id: string;
    email?: string;
    phone?: string;
    currencyCode: string;
    languageCode: string;
  };
}
