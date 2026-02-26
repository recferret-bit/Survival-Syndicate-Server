import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetUserBalanceQuery } from './get-user-balance.query';
import { GetUserBalanceResponseDto, BalanceDto } from './get-user-balance.dto';
import { UserBalancePortRepository } from '@app/auth-service/application/ports/user-balance.port.repository';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { getCurrencyVelueByStringCode, stringToBigNumber } from '@lib/shared';

@QueryHandler(GetUserBalanceQuery)
export class GetUserBalanceHandler
  implements IQueryHandler<GetUserBalanceQuery>
{
  private readonly logger = new Logger(GetUserBalanceHandler.name);

  constructor(
    private readonly userBalanceRepository: UserBalancePortRepository,
  ) {}

  async execute(
    query: GetUserBalanceQuery,
  ): Promise<GetUserBalanceResponseDto> {
    const { userId } = query.request;
    const userIdBigNumber = stringToBigNumber(userId);

    const userBalance =
      await this.userBalanceRepository.findByUserId(userIdBigNumber);

    if (!userBalance) {
      throw new NotFoundException(`Balance not found for userId: ${userId}`);
    }

    const balances: BalanceDto[] = [];

    const balanceDecimals = getCurrencyVelueByStringCode(
      userBalance.fiatBalance.currencyIsoCode,
    ).getDecimals();

    // Add fiat balance (amounts in smallest currency unit / cents)
    balances.push(
      {
        currencyIsoCode: userBalance.fiatBalance.currencyIsoCode,
        balance: userBalance.fiatBalance.balance.getAmount().toFixed(),
        balanceDecimals,
        currencyType: CurrencyType.FIAT,
      },
      {
        currencyIsoCode: userBalance.bonusBalance.currencyIsoCode,
        balance: userBalance.bonusBalance.balance.getAmount().toFixed(),
        balanceDecimals,
        currencyType: CurrencyType.BONUS,
      },
    );

    // Add crypto balance if it exists
    // if (userBalance.hasCryptoBalance() && userBalance.cryptoBalance) {
    //   balances.push({
    //     currencyIsoCode: userBalance.cryptoBalance.currencyIsoCode,
    //     balance: userBalance.cryptoBalance.balance.toUnitString(),
    //     balanceDecimal: userBalance.cryptoBalance.balance.toDecimalNumber(2),
    //     currencyType: CurrencyType.CRYPTO,
    //   });
    // }

    this.logger.log({
      userId,
      balances,
    });

    return { balances };
  }
}
