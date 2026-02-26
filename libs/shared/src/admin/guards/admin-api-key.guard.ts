import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersPublisher } from '@lib/lib-player';
import { ADMIN_API_KEY_NAME } from '@lib/shared/admin';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(AdminApiKeyGuard.name);

  constructor(private readonly usersPublisher: UsersPublisher) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers[ADMIN_API_KEY_NAME];

    if (!apiKey) {
      throw new UnauthorizedException('Admin API key is required');
    }

    try {
      const result = await this.usersPublisher.validateAdminApiKey({ apiKey });

      if (!result.valid) {
        const message =
          result.reason === 'inactive'
            ? 'Admin account is inactive'
            : 'Invalid admin API key';
        this.logger.warn(`Admin API key validation failed: ${message}`);
        throw new UnauthorizedException(message);
      }

      // Attach admin info to request for potential use in controllers
      request.admin = { id: result.adminId, email: result.email };
      this.logger.log(`Admin authenticated: ${result.email}`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Failed to validate admin API key: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Failed to validate admin API key');
    }
  }
}
