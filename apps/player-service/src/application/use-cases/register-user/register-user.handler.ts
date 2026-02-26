import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { RegisterUserResponseDto } from './register-user.dto';
import { Currencies } from '@lib/shared/currency/currency';
import { Languages } from '@lib/shared/language/language';
import { Utils, EnvService } from '@lib/shared/application';
import { AuthJwtService, UserSession } from '@lib/shared/auth';
import { User } from '@app/player-service/domain/entities/user/user';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { BalancePublisher } from '@lib/lib-building';
import { UsersPublisher } from '@lib/lib-player';
import { PrismaService } from '@app/player-service/infrastructure/prisma/prisma.service';
import { UserPrismaMapper } from '@app/player-service/infrastructure/prisma/mapper/user.prisma.mapper';
import { TrackingPrismaMapper } from '@app/player-service/infrastructure/prisma/mapper/tracking.prisma.mapper';
import { BearerTokenHashCacheService } from '@lib/shared/redis';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new Logger(RegisterUserHandler.name);

  constructor(
    private readonly userRepository: UserPortRepository,
    private readonly envService: EnvService,
    private readonly authJwtService: AuthJwtService,
    private readonly balancePublisher: BalancePublisher,
    private readonly usersPublisher: UsersPublisher,
    private readonly prisma: PrismaService,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
  ) {}

  async execute(
    command: RegisterUserCommand,
  ): Promise<RegisterUserResponseDto> {
    const { request } = command;
    const {
      email,
      phone,
      password,
      currencyIsoCode,
      languageIsoCode,
      country,
      name,
      birthday,
      ip,
      ...trackingData
    } = request;

    this.logger.log(`Registering user. email: ${email}, phone: ${phone}`);

    // Validate currency ISO code (Zod schema validates format, but we need the Currency object)
    const currency = Currencies.find((c) => c.getIsoCode() === currencyIsoCode);
    if (!currency) {
      throw new BadRequestException(
        `Invalid currency ISO code: ${currencyIsoCode}`,
      );
    }

    // Validate language ISO code (Zod schema validates format, but we need the Language object)
    const language = Languages.find((l) => l.getIsoCode() === languageIsoCode);
    if (!language) {
      throw new BadRequestException(
        `Invalid language ISO code: ${languageIsoCode}`,
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmailOrPhone(
      email,
      phone,
    );
    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone already exists',
      );
    }

    // Hash password
    const passwordSecret =
      this.envService.get('PASSWORD_SECRET') || 'default-secret';
    const passwordHash = await Utils.GetHashFromPassword(
      passwordSecret,
      password,
    );

    // Parse birthday if provided
    let birthdayDate: Date | undefined;
    if (request.birthday) {
      birthdayDate = new Date(request.birthday);
    }

    // Use Prisma transaction to ensure atomicity: user creation, tracking creation, and balance creation
    // If balance creation fails, the transaction will rollback user and tracking creation
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user within transaction
      const userEntity = await tx.user.create({
        data: UserPrismaMapper.toPrisma({
          email: email || undefined,
          phone: phone || undefined,
          passwordHash,
          name: name || undefined,
          isTest: false,
          banned: false,
          country: country || undefined,
          languageIsoCode,
          currencyIsoCode,
          birthday: birthdayDate,
        }),
      });

      const user = UserPrismaMapper.toDomain(userEntity);

      // Create tracking within transaction
      await tx.tracking.create({
        data: TrackingPrismaMapper.toPrisma({
          userId: user.id,
          firstIp: ip,
          lastIp: ip,
          gaClientId: trackingData.gaClientId,
          yaClientId: trackingData.yaClientId,
          clickId: trackingData.clickId,
          utmMedium: trackingData.utmMedium,
          utmSource: trackingData.utmSource,
          utmCampaign: trackingData.utmCampaign,
          pid: trackingData.pid,
          sub1: trackingData.sub1,
          sub2: trackingData.sub2,
          sub3: trackingData.sub3,
        }),
      });

      // Create user balance - if this fails, the transaction will rollback
      // Convert BigNumber to number for library schema (library uses number type)
      await this.balancePublisher.createUserBalance({
        userId: user.id.toString(),
        currencyIsoCodes: [currencyIsoCode],
      });

      this.logger.log(
        `User balance created successfully for userId: ${user.id.toString()}`,
      );

      return user;
    });

    // Generate JWT token
    const token = await this.generateToken(result, country);

    // Hash bearer token and store in Prisma and Redis
    const bearerTokenHash = await Utils.GetHashFromPassword(
      passwordSecret,
      token,
    );

    // Update user with bearer token hash in Prisma
    try {
      await this.userRepository.update(result.id.toNumber(), {
        bearerTokenHash,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to update user bearer token hash: ${error.message}`,
        error.stack,
      );
      // Don't fail registration if update fails
    }

    // Store bearer token hash in Redis
    try {
      this.logger.log(`Storing bearer token hash in Redis: ${bearerTokenHash}`);
      await this.bearerTokenHashCacheService.setBearerTokenHash(
        result.id.toString(),
        bearerTokenHash,
      );
      this.logger.log(`Bearer token hash stored in Redis: ${bearerTokenHash}`);
    } catch (error) {
      this.logger.warn(
        `Failed to store bearer token hash in cache: ${error.message}`,
        error.stack,
      );
      // Don't fail registration if cache update fails
    }

    this.logger.log(
      `User registered successfully. userId: ${result.id.toString()}`,
    );

    try {
      await this.usersPublisher.publishUserRegistered({
        userId: result.id.toString(),
        currencyIsoCode: result.currencyIsoCode,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to publish user-registered event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return {
      token,
      user: {
        id: result.id.toString(),
        email: result.email,
        phone: result.phone,
        currencyCode: result.currencyIsoCode,
        languageCode: result.languageIsoCode,
      },
    };
  }

  private async generateToken(user: User, country?: string): Promise<string> {
    const payload: UserSession = {
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      currencyCode: user.currencyIsoCode,
      geo: country || '',
      createdAt: user.createdAt.getTime(),
      isTestUser: user.isTest,
    };

    return this.authJwtService.generateToken(payload);
  }
}
