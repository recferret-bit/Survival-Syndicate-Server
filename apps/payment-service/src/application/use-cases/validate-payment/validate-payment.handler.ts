import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ValidatePaymentCommand } from './validate-payment.command';
import {
  type ValidatePaymentResponseDto,
  ValidatePaymentResponseSchema,
} from './validate-payment.dto';
import { AppleIAPPort } from '@app/payment-service/application/ports/apple-iap.port';
import { GooglePlayIAPPort } from '@app/payment-service/application/ports/google-play-iap.port';

@CommandHandler(ValidatePaymentCommand)
export class ValidatePaymentHandler
  implements ICommandHandler<ValidatePaymentCommand, ValidatePaymentResponseDto>
{
  constructor(
    private readonly appleIAP: AppleIAPPort,
    private readonly googlePlayIAP: GooglePlayIAPPort,
  ) {}

  async execute(
    command: ValidatePaymentCommand,
  ): Promise<ValidatePaymentResponseDto> {
    const valid =
      command.platform === 'apple'
        ? await this.appleIAP.validateReceipt(
            command.receipt,
            command.productId,
          )
        : await this.googlePlayIAP.validateReceipt(
            command.receipt,
            command.productId,
          );

    return ValidatePaymentResponseSchema.parse({ valid });
  }
}
