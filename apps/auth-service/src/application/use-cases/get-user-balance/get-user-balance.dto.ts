import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';

// Request DTO (internal use - userId comes from session)
export interface GetUserBalanceRequestDto {
  userId: string;
}

// Balance DTO with Swagger annotations
export class BalanceDto {
  @ApiProperty({
    description: 'Currency ISO code (e.g., USD, EUR, BDT)',
    example: 'USD',
  })
  currencyIsoCode: string;

  @ApiProperty({
    description:
      'Balance in smallest currency unit (e.g., cents) as integer string',
    example: '10000',
  })
  balance: string;

  @ApiProperty({
    description:
      'Number of decimal places for the currency (e.g., 2 for USD cents)',
    example: 2,
  })
  balanceDecimals: number;

  @ApiProperty({
    description: 'Currency type',
    enum: CurrencyType,
    example: CurrencyType.FIAT,
  })
  currencyType: CurrencyType;
}

// Response DTO with Swagger annotations
export class GetUserBalanceResponseDto {
  @ApiProperty({
    description: 'List of user balances by currency type',
    type: [BalanceDto],
    example: [
      {
        currencyIsoCode: 'USD',
        balance: '10000',
        balanceDecimals: 2,
        currencyType: CurrencyType.FIAT,
      },
      {
        currencyIsoCode: 'USD',
        balance: '5000',
        balanceDecimals: 2,
        currencyType: CurrencyType.BONUS,
      },
    ],
  })
  balances: BalanceDto[];
}
