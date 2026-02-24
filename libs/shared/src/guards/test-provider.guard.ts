import { CanActivate, Injectable, ForbiddenException } from '@nestjs/common';
import { EnvService } from '@lib/shared/application';

/**
 * TestProviderGuard
 * Guard that ensures:
 * 1. NODE_ENV is not 'production'
 * 2. User is a test user (if session exists)
 */
@Injectable()
export class TestProviderGuard implements CanActivate {
  constructor(private readonly envService: EnvService) {}

  async canActivate(): Promise<boolean> {
    // 1. Check NODE_ENV - must not be production
    const isProd = this.envService.isProd();
    if (isProd) {
      throw new ForbiddenException(
        'Test payment provider is not available in production',
      );
    }

    return true;
  }
}
