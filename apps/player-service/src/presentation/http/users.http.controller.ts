import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Logger,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Public, AuthJwtGuard, UserSession } from '@lib/shared/auth';
import { BaseHttpResponse } from '@lib/shared';
import { RegisterUserCommand } from '@app/users/application/use-cases/register-user/register-user.command';
import {
  RegisterUserHttpDto,
  RegisterUserResponseDto,
} from '@app/users/application/use-cases/register-user/register-user.dto';
import { LoginUserQuery } from '@app/users/application/use-cases/login-user/login-user.query';
import {
  LoginUserHttpDto,
  LoginUserResponseDto,
} from '@app/users/application/use-cases/login-user/login-user.dto';
import { GetProfileQuery } from '@app/users/application/use-cases/get-profile/get-profile.query';
import { GetProfileResponseDto } from '@app/users/application/use-cases/get-profile/get-profile.dto';
import { UpdateProfileCommand } from '@app/users/application/use-cases/update-profile/update-profile.command';
import {
  UpdateProfileHttpDto,
  UpdateProfileResponseDto,
} from '@app/users/application/use-cases/update-profile/update-profile.dto';
import { AttachEmailCommand } from '@app/users/application/use-cases/attach-email/attach-email.command';
import {
  AttachEmailHttpDto,
  AttachEmailResponseDto,
} from '@app/users/application/use-cases/attach-email/attach-email.dto';
import { AttachPhoneCommand } from '@app/users/application/use-cases/attach-phone/attach-phone.command';
import {
  AttachPhoneHttpDto,
  AttachPhoneResponseDto,
} from '@app/users/application/use-cases/attach-phone/attach-phone.dto';
import { GetCurrenciesResponseDto } from '@app/users/application/use-cases/get-currencies/get-currencies.dto';
import { GetLanguagesResponseDto } from '@app/users/application/use-cases/get-languages/get-languages.dto';
import { Currencies } from '@lib/shared/currency';
import { Languages } from '@lib/shared/language';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Controller()
@ApiTags('Users')
export class UsersHttpController {
  private readonly logger = new Logger(UsersHttpController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @HttpCode(200)
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 200,
    description: 'User registered successfully',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - user already exists' })
  async register(
    @Body() dto: RegisterUserHttpDto,
    @Req() request: Request,
  ): Promise<BaseHttpResponse<RegisterUserResponseDto>> {
    const ip = this.extractIp(request);
    this.logger.log(`Register request received from IP: ${ip}`);

    // Validation is handled automatically by NestJS ValidationPipe via createZodDto
    const result = await this.commandBus.execute(
      new RegisterUserCommand({
        ...dto,
        ip,
      }),
    );
    return {
      statusCode: 200,
      data: result,
    };
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: LoginUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials or banned',
  })
  @HttpCode(200)
  async login(
    @Body() dto: LoginUserHttpDto,
    @Req() request: Request,
  ): Promise<LoginUserResponseDto> {
    const ip = this.extractIp(request);
    this.logger.log(`Login request received from IP: ${ip}`);

    // Validation is handled automatically by NestJS ValidationPipe via createZodDto
    return this.queryBus.execute(
      new LoginUserQuery({
        ...dto,
        ip,
      }),
    );
  }

  @Get('profile')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: GetProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(
    @Req() req: RequestWithSession,
  ): Promise<GetProfileResponseDto> {
    this.logger.log('Get profile request received');

    const userId = req.session!.id;

    return this.queryBus.execute(new GetProfileQuery(userId));
  }

  @Patch('profile')
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (name and birthday)' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UpdateProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Body() dto: UpdateProfileHttpDto,
    @Req() req: RequestWithSession,
  ): Promise<UpdateProfileResponseDto> {
    this.logger.log('Update profile request received');

    const userId = req.session!.id;

    return this.commandBus.execute(new UpdateProfileCommand(userId, dto));
  }

  @Post('profile/attach-email')
  @HttpCode(200)
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Attach email to user profile (only if email is missing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email attached successfully',
    type: AttachEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or email already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already taken by another user',
  })
  async attachEmail(
    @Body() dto: AttachEmailHttpDto,
    @Req() req: RequestWithSession,
  ): Promise<BaseHttpResponse<AttachEmailResponseDto>> {
    this.logger.log('Attach email request received');

    const userId = req.session!.id;

    const result = await this.commandBus.execute(
      new AttachEmailCommand(userId, dto),
    );
    return {
      statusCode: 200,
      data: result,
    };
  }

  @Post('profile/attach-phone')
  @HttpCode(200)
  @UseGuards(AuthJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Attach phone to user profile (only if phone is missing)',
  })
  @ApiResponse({
    status: 200,
    description: 'Phone attached successfully',
    type: AttachPhoneResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or phone already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - phone already taken by another user',
  })
  async attachPhone(
    @Body() dto: AttachPhoneHttpDto,
    @Req() req: RequestWithSession,
  ): Promise<BaseHttpResponse<AttachPhoneResponseDto>> {
    this.logger.log('Attach phone request received');

    const userId = req.session!.id;

    const result = await this.commandBus.execute(
      new AttachPhoneCommand(userId, dto),
    );
    return {
      statusCode: 200,
      data: result,
    };
  }

  @Get('currencies')
  @Public()
  @ApiOperation({ summary: 'Get available currencies' })
  @ApiResponse({
    status: 200,
    description: 'Currencies retrieved successfully',
    type: GetCurrenciesResponseDto,
  })
  getCurrencies(): GetCurrenciesResponseDto {
    const currencies = Currencies.map((currency) => ({
      name: currency.getName(),
      symbol: currency.getSymbol(),
      isoCode: currency.getIsoCode(),
      isActive: currency.getIsActive(),
      decimals: currency.getDecimals(),
    }));
    return { currencies };
  }

  @Get('languages')
  @Public()
  @ApiOperation({ summary: 'Get available languages' })
  @ApiResponse({
    status: 200,
    description: 'Languages retrieved successfully',
    type: GetLanguagesResponseDto,
  })
  getLanguages(): GetLanguagesResponseDto {
    const languages = Languages.map((language) => ({
      text: language.getText(),
      languageCode: language.getLanguageCode(),
      isoCode: language.getIsoCode(),
      isActive: language.getIsActive(),
    }));
    return { languages };
  }

  private extractIp(request: Request): string {
    // Try X-Forwarded-For header first (for proxies/load balancers)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : typeof forwardedFor === 'string'
          ? forwardedFor
          : String(forwardedFor);
      // X-Forwarded-For can contain multiple IPs, take the first one
      return ips.split(',')[0].trim();
    }

    // Try X-Real-IP header
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      if (Array.isArray(realIp)) {
        return realIp[0] || '0.0.0.0';
      }
      return typeof realIp === 'string' ? realIp : String(realIp);
    }

    // Fallback to request IP
    if (request.ip) {
      return request.ip;
    }
    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress;
    }
    return '0.0.0.0';
  }
}
