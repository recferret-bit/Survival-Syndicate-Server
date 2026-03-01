import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminApiKeyGuard } from '@lib/shared/admin/guards/admin-api-key.guard';
import { BaseHttpResponse } from '@lib/shared';
import { RecalculateBalanceCommand } from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.command';
import {
  RecalculateBalanceHttpDto,
  RecalculateBalanceResponseDto,
} from '@app/auth-service/application/use-cases/recalculate-balance/recalculate-balance.dto';
import { IncreaseFiatBalanceCommand } from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.command';
import {
  IncreaseFiatBalanceHttpDto,
  IncreaseFiatBalanceResponseDto,
} from '@app/auth-service/application/use-cases/increase-fiat-balance/increase-fiat-balance.dto';

@Controller('admin/balance')
@ApiTags('Balance Admin')
@UseGuards(AdminApiKeyGuard)
export class BalanceAdminHttpController {
  private readonly logger = new Logger(BalanceAdminHttpController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post('increase')
  @HttpCode(200)
  @ApiOperation({ summary: 'Increase user fiat balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance increased successfully',
    type: IncreaseFiatBalanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid API key' })
  @ApiResponse({ status: 404, description: 'User balance not found' })
  async increaseFiatBalance(
    @Body() dto: IncreaseFiatBalanceHttpDto,
    @Req() req: Request & { admin?: { id: string; email: string } },
  ): Promise<BaseHttpResponse<IncreaseFiatBalanceResponseDto>> {
    this.logger.log(
      `Increase fiat balance request received for userId: ${dto.userId}, amount: ${dto.amount}`,
    );

    const result = await this.commandBus.execute(
      new IncreaseFiatBalanceCommand(dto, req.admin?.id),
    );
    return {
      statusCode: 200,
      data: result,
    };
  }

  @Post('recalculate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recalculate user balance' })
  @ApiResponse({
    status: 200,
    description: 'Balance recalculated successfully',
    type: RecalculateBalanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid API key' })
  async recalculateBalance(
    @Body() dto: RecalculateBalanceHttpDto,
  ): Promise<BaseHttpResponse<RecalculateBalanceResponseDto>> {
    this.logger.log(
      `Recalculate balance request received for userId: ${dto.userId}`,
    );

    // Validation is handled automatically by NestJS ValidationPipe via createZodDto
    const result = await this.commandBus.execute(
      new RecalculateBalanceCommand(dto),
    );
    return {
      statusCode: 200,
      data: result,
    };
  }
}
