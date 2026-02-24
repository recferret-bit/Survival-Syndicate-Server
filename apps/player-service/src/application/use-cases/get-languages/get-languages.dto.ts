import { ApiProperty } from '@nestjs/swagger';

export class LanguageDto {
  @ApiProperty({ description: 'Language name', example: 'English' })
  text: string;

  @ApiProperty({ description: 'Language code', example: 'EN' })
  languageCode: string;

  @ApiProperty({ description: 'Language ISO code', example: 'en' })
  isoCode: string;

  @ApiProperty({ description: 'Whether language is active', example: true })
  isActive: boolean;
}

export class GetLanguagesResponseDto {
  @ApiProperty({
    description: 'List of available languages',
    type: [LanguageDto],
  })
  languages: LanguageDto[];
}
