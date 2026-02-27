import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { AuthResponseDto } from '@app/auth-service/application/use-cases/register/register.dto';

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export class LoginHttpDto extends createZodDto(LoginRequestSchema) {
  @ApiProperty({ example: 'user@example.com' })
  declare email: string;

  @ApiProperty({ example: 'StrongPassword123' })
  declare password: string;
}

export class LoginResponseDto extends AuthResponseDto {}
