import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { bigNumberToDecimal } from '@lib/shared';
import { GetUserBalanceQuery } from '@app/auth-service/application/use-cases/get-user-balance/get-user-balance.query';
import { GetUserBalanceResponseDto } from '@app/auth-service/application/use-cases/get-user-balance/get-user-balance.dto';
import { GetUserBalanceHttpResponseDto } from './dto/get-user-balance.http.dto';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('balance')
@ApiTags('Balance')
@UseGuards(AuthJwtGuard)
@ApiBearerAuth()
export class BalanceHttpController {
  private readonly logger = new Logger(BalanceHttpController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: GetUserBalanceHttpResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Balance not found for user' })
  async getBalance(
    @Req() req: RequestWithSession,
  ): Promise<GetUserBalanceHttpResponseDto> {
    this.logger.log('Get balance request received');

    const userId = req.session!.id.toString();

    const result: GetUserBalanceResponseDto = await this.queryBus.execute(
      new GetUserBalanceQuery({
        userId,
      }),
    );

    // Convert cents (smallest unit) to decimal for HTTP response
    return {
      balances: result.balances.map((b) => ({
        currencyIsoCode: b.currencyIsoCode,
        balance: bigNumberToDecimal(b.balance, b.balanceDecimals),
        currencyType: b.currencyType,
      })),
    };
  }
}
