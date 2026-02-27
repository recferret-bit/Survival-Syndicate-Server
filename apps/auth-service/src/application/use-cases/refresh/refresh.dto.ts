import { createZodDto } from '@anatine/zod-nestjs';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { AuthResponseDto } from '@app/auth-service/application/use-cases/register/register.dto';

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshRequestDto = z.infer<typeof RefreshRequestSchema>;

export class RefreshHttpDto extends createZodDto(RefreshRequestSchema) {
  @ApiProperty()
  declare refreshToken: string;
}

export class RefreshResponseDto extends AuthResponseDto {}
