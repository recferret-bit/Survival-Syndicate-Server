import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { ValidatePaymentCommand } from '@app/payment-service/application/use-cases/validate-payment/validate-payment.command';
import {
  type ValidatePaymentResponseDto,
  ValidatePaymentRequestHttpDto,
  ValidatePaymentResponseHttpDto,
} from '@app/payment-service/application/use-cases/validate-payment/validate-payment.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('payment')
@ApiTags('Payment')
export class PaymentHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('validate')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate IAP receipt (stub)' })
  @ApiResponse({ status: 200, type: ValidatePaymentResponseHttpDto })
  async validate(
    @Req() _req: RequestWithSession,
    @Body() dto: ValidatePaymentRequestHttpDto,
  ): Promise<ValidatePaymentResponseDto> {
    return this.commandBus.execute(
      new ValidatePaymentCommand(
        dto.receipt,
        dto.productId,
        dto.platform,
        dto.characterId,
      ),
    );
  }
}
