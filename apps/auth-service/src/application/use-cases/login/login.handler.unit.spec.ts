import { Test } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { BearerTokenHashCacheService } from '@lib/shared/redis';
import { EnvService } from '@lib/shared/application';
import { LoginQuery } from './login.query';

describe('LoginHandler', () => {
  it('logs user in and returns token pair', async () => {
    const mockRepository = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 1n,
        email: 'user@example.com',
        username: 'playerOne',
        verifyPasswordHash: () => true,
      }),
      updateBearerTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    const mockTokenService = {
      generateTokenPair: jest.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    };
    const mockRefreshStore = { set: jest.fn().mockResolvedValue(undefined) };
    const mockBearerCache = {
      setBearerTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    const mockEnv = {
      get: jest.fn().mockReturnValue('secret'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        LoginHandler,
        { provide: AuthUserPortRepository, useValue: mockRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenStoreService, useValue: mockRefreshStore },
        { provide: BearerTokenHashCacheService, useValue: mockBearerCache },
        { provide: EnvService, useValue: mockEnv },
      ],
    }).compile();

    const handler = moduleRef.get(LoginHandler);
    const result = await handler.execute(
      new LoginQuery({
        email: 'user@example.com',
        password: 'StrongPassword123',
      }),
    );

    expect(result.tokens.accessToken).toBe('access');
    expect(result.user.id).toBe('1');
  });
});
