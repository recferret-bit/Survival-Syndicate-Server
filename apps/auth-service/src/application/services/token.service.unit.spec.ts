import { TokenService } from './token.service';
import { EnvService } from '@lib/shared/application';

describe('TokenService', () => {
  const envService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret';
      }
      return undefined;
    }),
  } as unknown as EnvService;

  it('generates access and refresh tokens', async () => {
    const service = new TokenService(envService);
    const pair = await service.generateTokenPair({
      id: '1',
      email: 'user@example.com',
      username: 'playerOne',
      roles: ['user'],
    });

    expect(pair.accessToken).toBeDefined();
    expect(pair.refreshToken).toBeDefined();
    expect(pair.accessToken).not.toEqual(pair.refreshToken);
  });

  it('verifies refresh token payload', async () => {
    const service = new TokenService(envService);
    const pair = await service.generateTokenPair({
      id: '1',
      email: 'user@example.com',
      username: 'playerOne',
      roles: ['user'],
    });

    const payload = await service.verifyRefreshToken(pair.refreshToken);
    expect(payload.id).toBe('1');
    expect(payload.email).toBe('user@example.com');
  });
});
