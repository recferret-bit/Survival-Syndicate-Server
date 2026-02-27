import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileResponseDto {
  @ApiProperty()
  playerId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;
}
