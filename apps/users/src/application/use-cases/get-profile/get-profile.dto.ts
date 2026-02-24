import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: '12345' })
  id: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'User name', example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({
    description: 'User country code',
    example: 'USA',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'User birthday in ISO 8601 format',
    example: '1990-01-01T00:00:00Z',
  })
  birthday?: string;

  @ApiProperty({
    description: 'Language ISO code',
    example: 'en',
  })
  languageIsoCode: string;

  @ApiProperty({
    description: 'Currency ISO code',
    example: 'USD',
  })
  currencyIsoCode: string;
}
