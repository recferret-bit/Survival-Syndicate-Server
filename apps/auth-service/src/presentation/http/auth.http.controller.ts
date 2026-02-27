import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public, AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { RegisterCommand } from '@app/auth-service/application/use-cases/register/register.command';
import {
  RegisterHttpDto,
  AuthResponseDto,
} from '@app/auth-service/application/use-cases/register/register.dto';
import { LoginQuery } from '@app/auth-service/application/use-cases/login/login.query';
import { LoginHttpDto } from '@app/auth-service/application/use-cases/login/login.dto';
import { RefreshCommand } from '@app/auth-service/application/use-cases/refresh/refresh.command';
import { RefreshHttpDto } from '@app/auth-service/application/use-cases/refresh/refresh.dto';
import { LogoutCommand } from '@app/auth-service/application/use-cases/logout/logout.command';
import { LogoutResponseDto } from '@app/auth-service/application/use-cases/logout/logout.dto';
import { Request } from 'express';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthHttpController {
  private readonly logger = new Logger(AuthHttpController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async register(@Body() dto: RegisterHttpDto): Promise<AuthResponseDto> {
    this.logger.log(`Register request received for ${dto.email}`);
    return this.commandBus.execute(new RegisterCommand(dto));
  }

  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginHttpDto): Promise<AuthResponseDto> {
    this.logger.log(`Login request received for ${dto.email}`);
    return this.queryBus.execute(new LoginQuery(dto));
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh token pair' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() dto: RefreshHttpDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new RefreshCommand(dto));
  }

  @Post('logout')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user and revoke tokens' })
  @ApiResponse({ status: 200, type: LogoutResponseDto })
  async logout(@Req() req: RequestWithSession): Promise<LogoutResponseDto> {
    const userId = req.session!.id;
    return this.commandBus.execute(new LogoutCommand(userId));
  }
}
