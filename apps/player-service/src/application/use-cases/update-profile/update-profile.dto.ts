import { createZodDto } from '@anatine/zod-nestjs';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

// Zod schema for validation
export const UpdateProfileRequestSchema = z
  .object({
    name: z
      .string()
      .max(255, 'Name must not exceed 255 characters')
      .optional()
      .transform((val) =>
        val && val.trim().length > 0 ? val.trim() : undefined,
      ),
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
  })
  .refine(
    (data) => {
      const hasName = data.name && data.name.trim().length > 0;
      const hasBirthday = data.birthday && data.birthday.trim().length > 0;
      return hasName || hasBirthday;
    },
    {
      message: 'At least one field (name or birthday) must be provided',
      path: ['name', 'birthday'],
    },
  );

export type UpdateProfileRequestDto = z.infer<
  typeof UpdateProfileRequestSchema
>;

// HTTP DTO generated from Zod schema with enhanced Swagger documentation
export class UpdateProfileHttpDto extends createZodDto(
  UpdateProfileRequestSchema,
) {
  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
    maxLength: 255,
  })
  declare name?: string;

  @ApiPropertyOptional({
    description: 'User birthday in ISO 8601 format',
    example: '1990-01-01T00:00:00Z',
  })
  declare birthday?: string;
}

export class UpdateProfileResponseDto {
  @ApiPropertyOptional({ description: 'User name', example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({
    description: 'User birthday in ISO 8601 format',
    example: '1990-01-01T00:00:00Z',
  })
  birthday?: string;
}
