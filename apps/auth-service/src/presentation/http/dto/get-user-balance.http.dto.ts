import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';

/**
 * HTTP-specific Balance DTO
 * Returns balance as decimal string (e.g., "1000.00") for API consumers
 */
export class BalanceHttpDto {
  @ApiProperty({
    description: 'Currency ISO code (e.g., USD, EUR, BDT)',
    example: 'USD',
  })
  currencyIsoCode: string;

  @ApiProperty({
    description: 'Balance in decimal format (e.g., "1000.00")',
    example: '1000.00',
  })
  balance: string;

  @ApiProperty({
    description: 'Currency type',
    enum: CurrencyType,
    example: CurrencyType.FIAT,
  })
  currencyType: CurrencyType;
}

/**
 * HTTP-specific response DTO for get user balance
 */
export class GetUserBalanceHttpResponseDto {
  @ApiProperty({
    description: 'List of user balances by currency type',
    type: [BalanceHttpDto],
    example: [
      {
        currencyIsoCode: 'USD',
        balance: '1000.00',
        currencyType: CurrencyType.FIAT,
      },
      {
        currencyIsoCode: 'USD',
        balance: '500.00',
        currencyType: CurrencyType.BONUS,
      },
    ],
  })
  balances: BalanceHttpDto[];
}
