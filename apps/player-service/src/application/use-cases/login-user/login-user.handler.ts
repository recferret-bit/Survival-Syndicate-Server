import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { LoginUserQuery } from './login-user.query';
import { LoginUserResponseDto } from './login-user.dto';
import { Utils, EnvService } from '@lib/shared/application';
import { AuthJwtService, UserSession } from '@lib/shared/auth';
import { User } from '@app/users/domain/entities/user/user';
import { TrackingPortRepository } from '@app/users/application/ports/tracking.port.repository';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { BearerTokenHashCacheService } from '@lib/shared/redis';

@QueryHandler(LoginUserQuery)
export class LoginUserHandler implements IQueryHandler<LoginUserQuery> {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    private readonly userRepository: UserPortRepository,
    private readonly trackingRepository: TrackingPortRepository,
    private readonly envService: EnvService,
    private readonly authJwtService: AuthJwtService,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
  ) {}

  async execute(query: LoginUserQuery): Promise<LoginUserResponseDto> {
    const { request } = query;
    const { email, phone, password, ip } = request;

    this.logger.log(`Login attempt. email: ${email}, phone: ${phone}`);

    // Find user
    const user = await this.userRepository.findByEmailOrPhone(email, phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is banned
    if (user.isBanned()) {
      throw new UnauthorizedException('User account is banned');
    }

    // Verify password
    const passwordSecret =
      this.envService.get('PASSWORD_SECRET') || 'default-secret';
    const passwordHash = await Utils.GetHashFromPassword(
      passwordSecret,
      password,
    );

    if (user.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update tracking last IP
    try {
      await this.trackingRepository.updateLastIp(user.id, ip);
    } catch (error) {
      this.logger.warn(
        `Failed to update tracking IP for user ${user.id}: ${error}`,
      );
      // Don't fail login if tracking update fails
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    // Hash bearer token and update in Prisma and Redis
    const bearerTokenHash = await Utils.GetHashFromPassword(
      passwordSecret,
      token,
    );

    // Update user with bearer token hash in Prisma
    try {
      await this.userRepository.update(user.id.toNumber(), {
        bearerTokenHash,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to update user bearer token hash: ${error.message}`,
        error.stack,
      );
      // Don't fail login if update fails
    }

    // Store bearer token hash in Redis
    try {
      this.logger.log(`Storing bearer token hash in Redis: ${bearerTokenHash}`);
      await this.bearerTokenHashCacheService.setBearerTokenHash(
        user.id.toString(),
        bearerTokenHash,
      );
      this.logger.log(`Bearer token hash stored in Redis: ${bearerTokenHash}`);
    } catch (error) {
      this.logger.warn(
        `Failed to store bearer token hash in cache: ${error.message}`,
        error.stack,
      );
      // Don't fail login if cache update fails
    }

    this.logger.log(`User logged in successfully. userId: ${user.id}`);

    return {
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        phone: user.phone,
        currencyCode: user.currencyIsoCode,
        languageCode: user.languageIsoCode,
      },
    };
  }

  private async generateToken(user: User): Promise<string> {
    const payload: UserSession = {
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      currencyCode: user.currencyIsoCode,
      geo: user.country || '',
      createdAt: user.createdAt.getTime(),
      isTestUser: user.isTest,
    };

    return this.authJwtService.generateToken(payload);
  }
}
