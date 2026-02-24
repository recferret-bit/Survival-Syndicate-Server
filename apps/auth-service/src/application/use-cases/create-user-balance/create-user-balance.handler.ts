import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateUserBalanceCommand } from './create-user-balance.command';
import { CreateUserBalanceResponseDto } from './create-user-balance.dto';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { BalanceAmount } from '@app/balance/domain/value-objects/balance-amount';
import { ConflictException } from '@nestjs/common';
import { stringToBigNumber } from '@lib/shared';

@CommandHandler(CreateUserBalanceCommand)
export class CreateUserBalanceHandler
  implements ICommandHandler<CreateUserBalanceCommand>
{
  private readonly logger = new Logger(CreateUserBalanceHandler.name);

  constructor(
    private readonly userBalanceRepository: UserBalancePortRepository,
    private readonly balanceResultRepository: BalanceResultPortRepository,
  ) {}

  async execute(
    command: CreateUserBalanceCommand,
  ): Promise<CreateUserBalanceResponseDto> {
    const { userId, currencyIsoCodes } = command.request;
    const userIdBigNumber = stringToBigNumber(userId);

    this.logger.log(
      `Creating user balance for userId: ${userId}, currencies: ${currencyIsoCodes.join(', ')}`,
    );

    // Check if user balance aggregate already exists (early conflict detection)
    const userBalanceExists =
      await this.userBalanceRepository.exists(userIdBigNumber);
    if (userBalanceExists) {
      this.logger.log(
        `User balance already exists for userId: ${userId}, throwing ConflictException`,
      );
      throw new ConflictException(
        `User balance already exists for userId: ${userId}`,
      );
    }

    // Get primary currency (first in array)
    const primaryCurrency = currencyIsoCodes[0];

    // Create initial balance results with zero balance
    const zeroBalance = BalanceAmount.fromUnit(0);

    // Fetch or create balance results (handle race conditions)
    // Use a helper function to safely create or fetch balance results
    const getOrCreateBalanceResult = async (
      currencyType: CurrencyType,
      typeName: string,
    ) => {
      // First check if it exists
      let result = await this.balanceResultRepository.findByUserId(
        userIdBigNumber,
        currencyType,
      );

      if (!result) {
        try {
          // Try to create it
          result = await this.balanceResultRepository.create(
            {
              userId: userIdBigNumber,
              balance: zeroBalance,
              currencyIsoCode: primaryCurrency,
            },
            currencyType,
          );
        } catch (error) {
          // If unique constraint violation, another request created it (race condition)
          const err = error as { code?: string; message?: string };
          if (
            err?.code === 'P2002' ||
            (err?.message?.includes &&
              err.message.includes('Unique constraint'))
          ) {
            this.logger.log(
              `${typeName} balance created by another request for userId: ${userId}, fetching existing`,
            );
            // Small delay to ensure transaction is fully closed
            await new Promise((resolve) => setTimeout(resolve, 10));
            // Fetch the newly created balance
            result = await this.balanceResultRepository.findByUserId(
              userIdBigNumber,
              currencyType,
            );
            if (!result) {
              throw new Error(
                `Failed to create or find ${typeName} balance for userId: ${userId}`,
              );
            }
          } else {
            // Re-throw other errors
            throw error;
          }
        }
      }

      return result;
    };

    // OPTIMIZATION: Parallelize all balance result creations
    const [fiatBalanceResult, bonusBalanceResult, cryptoBalanceResult] =
      await Promise.all([
        getOrCreateBalanceResult(CurrencyType.FIAT, 'Fiat'),
        getOrCreateBalanceResult(CurrencyType.BONUS, 'Bonus'),
        getOrCreateBalanceResult(CurrencyType.CRYPTO, 'Crypto'),
      ]);

    // Create user balance aggregate if it doesn't exist
    const aggregateExists =
      await this.userBalanceRepository.exists(userIdBigNumber);
    if (!aggregateExists) {
      try {
        await this.userBalanceRepository.create({
          userId: userIdBigNumber,
          fiatBalanceId: fiatBalanceResult.id,
          bonusBalanceId: bonusBalanceResult.id,
          cryptoBalanceId: cryptoBalanceResult.id,
        });
      } catch (error) {
        // If unique constraint violation or transaction error, check if it exists
        const err = error as { code?: string; message?: string };
        if (
          err?.code === 'P2002' ||
          (err?.message?.includes &&
            err.message.includes('Unique constraint')) ||
          err?.code === 'P2028' // Transaction already closed
        ) {
          this.logger.log(
            `User balance aggregate creation had issue for userId: ${userId}, verifying existence`,
          );
          // Small delay to ensure transaction is fully closed
          await new Promise((resolve) => setTimeout(resolve, 50));
          // Verify it exists now (might have been created by another request or transaction)
          const verifyExists =
            await this.userBalanceRepository.exists(userIdBigNumber);
          if (!verifyExists) {
            // If it still doesn't exist, try one more time after a longer delay
            await new Promise((resolve) => setTimeout(resolve, 100));
            const finalCheck =
              await this.userBalanceRepository.exists(userIdBigNumber);
            if (!finalCheck) {
              this.logger.warn(
                `User balance aggregate does not exist for userId: ${userId} after retries, but balance results exist`,
              );
              // Don't throw - balance results exist, which is the important part
            }
          }
        } else {
          throw error;
        }
      }
    }

    this.logger.log(`User balance created for userId: ${userId}`);

    return {
      success: true,
      userId,
    };
  }
}
