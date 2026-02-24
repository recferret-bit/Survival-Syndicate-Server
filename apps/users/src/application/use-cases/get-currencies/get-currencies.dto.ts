import { ApiProperty } from '@nestjs/swagger';

export class CurrencyDto {
  @ApiProperty({ description: 'Currency name', example: 'US Dollar' })
  name: string;

  @ApiProperty({ description: 'Currency symbol', example: '$' })
  symbol: string;

  @ApiProperty({ description: 'Currency ISO code', example: 'USD' })
  isoCode: string;

  @ApiProperty({ description: 'Whether currency is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Number of decimal places', example: 2 })
  decimals: number;
}

export class GetCurrenciesResponseDto {
  @ApiProperty({
    description: 'List of available currencies',
    type: [CurrencyDto],
  })
  currencies: CurrencyDto[];
}
