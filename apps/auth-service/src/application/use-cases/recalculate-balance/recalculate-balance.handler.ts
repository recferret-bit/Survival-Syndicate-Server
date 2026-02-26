import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RecalculateBalanceCommand } from './recalculate-balance.command';
import { RecalculateBalanceResponseDto } from './recalculate-balance.dto';
import { BalanceRecalculationService } from '@app/auth-service/infrastructure/services/balance-recalculation.service';
import { CurrencyType } from '@app/auth-service/domain/value-objects/currency-type';
import { Currencies } from '@lib/shared/currency/currency';
import { stringToBigNumber } from '@lib/shared';

@CommandHandler(RecalculateBalanceCommand)
export class RecalculateBalanceHandler
  implements ICommandHandler<RecalculateBalanceCommand>
{
  private readonly logger = new Logger(RecalculateBalanceHandler.name);

  constructor(
    private readonly recalculationService: BalanceRecalculationService,
  ) {}

  async execute(
    command: RecalculateBalanceCommand,
  ): Promise<RecalculateBalanceResponseDto> {
    const { userId, currencyType } = command.request;
    const userIdBigNumber = stringToBigNumber(userId);

    this.logger.log(
      `Starting balance recalculation for userId: ${userIdBigNumber.toString()}, currencyType: ${currencyType || 'ALL'}`,
    );

    // Get default currency ISO code (using first available currency)
    const defaultCurrencyIsoCode = Currencies[0]?.getIsoCode() || 'USD';

    // If currencyType is specified, recalculate only that type
    if (currencyType) {
      await this.recalculationService.recalculateBalance(
        userIdBigNumber,
        currencyType,
        defaultCurrencyIsoCode,
      );
    } else {
      // Recalculate all currency types
      await Promise.all([
        this.recalculationService.recalculateBalance(
          userIdBigNumber,
          CurrencyType.FIAT,
          defaultCurrencyIsoCode,
        ),
        this.recalculationService.recalculateBalance(
          userIdBigNumber,
          CurrencyType.BONUS,
          defaultCurrencyIsoCode,
        ),
      ]);
    }

    const recalculatedAt = new Date();

    this.logger.log(
      `Balance recalculation completed for userId: ${userIdBigNumber.toString()}, currencyType: ${currencyType || 'ALL'}`,
    );

    return {
      success: true,
      recalculatedAt,
    };
  }
}
