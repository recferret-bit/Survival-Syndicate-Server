import { AuthUser } from './auth-user';

describe('AuthUser', () => {
  it('creates entity with valid props', () => {
    const entity = new AuthUser({
      id: 1n,
      email: 'user@example.com',
      username: 'playerOne',
      passwordHash: 'hash',
      currencyIsoCode: 'USD',
      languageIsoCode: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(entity.id).toBe(1n);
    expect(entity.email).toBe('user@example.com');
    expect(entity.username).toBe('playerOne');
  });

  it('verifies password hash equality', () => {
    const entity = new AuthUser({
      id: 1n,
      email: 'user@example.com',
      username: 'playerOne',
      passwordHash: 'hash',
      currencyIsoCode: 'USD',
      languageIsoCode: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(entity.verifyPasswordHash('hash')).toBe(true);
    expect(entity.verifyPasswordHash('other')).toBe(false);
  });
});
