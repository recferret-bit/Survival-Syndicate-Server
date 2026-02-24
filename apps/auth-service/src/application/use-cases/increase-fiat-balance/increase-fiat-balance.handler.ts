import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IncreaseFiatBalanceCommand } from './increase-fiat-balance.command';
import { IncreaseFiatBalanceResponseDto } from './increase-fiat-balance.dto';
import { AddBalanceEntryCommand } from '@app/balance/application/use-cases/add-balance-entry/add-balance-entry.command';
import { CurrencyType } from '@app/balance/domain/value-objects/currency-type';
import { OperationType } from '@app/balance/domain/value-objects/operation-type';
import { OperationStatus } from '@app/balance/domain/value-objects/operation-status';
import { LedgerReason } from '@app/balance/domain/value-objects/ledger-reason';

@CommandHandler(IncreaseFiatBalanceCommand)
export class IncreaseFiatBalanceHandler
  implements ICommandHandler<IncreaseFiatBalanceCommand>
{
  private readonly logger = new Logger(IncreaseFiatBalanceHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: IncreaseFiatBalanceCommand,
  ): Promise<IncreaseFiatBalanceResponseDto> {
    const {
      userId,
      amount,
      operationId: providedOperationId,
    } = command.request;
    const adminId = command.adminId;

    const operationId =
      providedOperationId ??
      `admin-increase-${adminId ?? 'unknown'}-${randomUUID()}`;

    this.logger.log(
      `Increasing fiat balance for userId: ${userId}, amount: ${amount}, operationId: ${operationId}`,
    );

    const addBalanceEntryCommand = new AddBalanceEntryCommand({
      userId,
      operationId,
      currencyType: CurrencyType.FIAT,
      amount,
      operationType: OperationType.ADD,
      operationStatus: OperationStatus.COMPLETED,
      reason: LedgerReason.ADMIN_CORRECTION,
    });

    return this.commandBus.execute(addBalanceEntryCommand);
  }
}
