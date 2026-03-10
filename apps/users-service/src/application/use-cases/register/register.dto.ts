import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8),
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export class RegisterHttpDto extends createZodDto(RegisterRequestSchema) {
  @ApiProperty({ example: 'user@example.com' })
  declare email: string;

  @ApiProperty({ example: 'playerOne' })
  declare username: string;

  @ApiProperty({ example: 'StrongPassword123' })
  declare password: string;
}

export class AuthUserDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'playerOne' })
  username: string;
}

export class TokenPairDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: TokenPairDto })
  tokens: TokenPairDto;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
