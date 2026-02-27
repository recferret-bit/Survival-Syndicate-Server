import { Test } from '@nestjs/testing';
import { RegisterHandler } from './register.handler';
import { AuthUserPortRepository } from '@app/auth-service/application/ports/auth-user.port.repository';
import { TokenService } from '@app/auth-service/application/services/token.service';
import { RefreshTokenStoreService } from '@app/auth-service/application/services/refresh-token-store.service';
import { BearerTokenHashCacheService } from '@lib/shared/redis';
import { PlayerPublisher } from '@lib/lib-player';
import { EnvService } from '@lib/shared/application';
import { RegisterCommand } from './register.command';

describe('RegisterHandler', () => {
  it('registers user and returns token pair', async () => {
    const mockRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 1n,
        email: 'user@example.com',
        username: 'playerOne',
        currencyIsoCode: 'USD',
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
    const mockPlayerPublisher = {
      publishUserRegistered: jest.fn().mockResolvedValue(undefined),
    };
    const mockEnv = {
      get: jest.fn().mockReturnValue('secret'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        { provide: AuthUserPortRepository, useValue: mockRepository },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RefreshTokenStoreService, useValue: mockRefreshStore },
        { provide: BearerTokenHashCacheService, useValue: mockBearerCache },
        { provide: PlayerPublisher, useValue: mockPlayerPublisher },
        { provide: EnvService, useValue: mockEnv },
      ],
    }).compile();

    const handler = moduleRef.get(RegisterHandler);
    const result = await handler.execute(
      new RegisterCommand({
        email: 'user@example.com',
        username: 'playerOne',
        password: 'StrongPassword123',
      }),
    );

    expect(result.tokens.accessToken).toBe('access');
    expect(result.tokens.refreshToken).toBe('refresh');
    expect(result.user.email).toBe('user@example.com');
  });
});
