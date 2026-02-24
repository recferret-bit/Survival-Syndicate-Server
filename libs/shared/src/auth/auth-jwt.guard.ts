import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthJwtService } from './auth-jwt.service';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { Reflector } from '@nestjs/core';
import { UserSession } from './interface/user-session.interface';
import { BannedUsersCacheService, BearerTokenHashCacheService } from '../redis';
import { Utils, EnvService } from '../application';

interface RequestWithSession extends Request {
  session?: UserSession;
}

@Injectable()
export class AuthJwtGuard implements CanActivate {
  private readonly logger = new Logger(AuthJwtGuard.name);

  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly reflector: Reflector,
    private readonly bearerTokenHashCacheService: BearerTokenHashCacheService,
    private readonly bannedUsersCacheService: BannedUsersCacheService,
    private readonly envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const session = await this.extractAndVerifyToken(request);

    await this.validateBearerTokenHash(session, token);
    await this.validateUserNotBanned(session);

    request.session = session;
    return !!session;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async extractAndVerifyToken(
    request: RequestWithSession,
  ): Promise<UserSession> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      return await this.authJwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async validateBearerTokenHash(
    session: UserSession,
    token: string,
  ): Promise<void> {
    if (!this.bearerTokenHashCacheService || !session) {
      return;
    }

    try {
      // Hash the incoming bearer token
      const passwordSecret =
        this.envService.get('PASSWORD_SECRET') || 'default-secret';
      const incomingHash = await Utils.GetHashFromPassword(
        passwordSecret,
        token,
      );

      // Get stored bearer token hash from Redis
      const storedHash =
        await this.bearerTokenHashCacheService.getBearerTokenHash(session.id);

      // Compare hashes using timing-safe comparison
      if (!storedHash || incomingHash !== storedHash) {
        this.logger.warn(`Bearer token hash mismatch for user: ${session.id}`, {
          userId: session.id,
        });
        throw new UnauthorizedException('Invalid bearer token');
      }
    } catch (error) {
      // If error is UnauthorizedException from hash check, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // If Redis is unavailable, log warning but allow request (fail-open)
      this.logger.warn(
        `Redis unavailable for bearer token hash check, allowing request: ${error.message}`,
      );
    }
  }

  private async validateUserNotBanned(session: UserSession): Promise<void> {
    if (!this.bannedUsersCacheService || !session) {
      return;
    }

    try {
      const isBanned = await this.bannedUsersCacheService.isBanned(session.id);
      if (isBanned) {
        this.logger.warn(
          `Banned user attempted to access protected resource: ${session.id}`,
        );
        throw new UnauthorizedException('User account is banned');
      }
    } catch (error) {
      // If error is UnauthorizedException from ban check, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // If Redis is unavailable, log warning but allow request (fail-open)
      this.logger.warn(
        `Redis unavailable for ban check, allowing request: ${error.message}`,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    Logger.log(`Headers: ${JSON.stringify(request.headers)}`);
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
