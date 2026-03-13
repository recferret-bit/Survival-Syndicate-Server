import { AuthUserPrismaMapper } from './auth-user.prisma.mapper';

describe('AuthUserPrismaMapper', () => {
  it('maps prisma entity to domain', () => {
    const domain = AuthUserPrismaMapper.toDomain({
      id: 1n,
      email: 'user@example.com',
      passwordHash: 'hash',
      bearerTokenHash: null,
      username: 'playerOne',
      isTest: false,
      banned: false,
      country: null,
      languageIsoCode: 'en',
      currencyIsoCode: 'USD',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(domain.id).toBe(1n);
    expect(domain.email).toBe('user@example.com');
    expect(domain.username).toBe('playerOne');
  });

  it('maps create data to prisma input', () => {
    const prisma = AuthUserPrismaMapper.toPrismaCreate({
      email: 'user@example.com',
      username: 'playerOne',
      passwordHash: 'hash',
      currencyIsoCode: 'USD',
      languageIsoCode: 'en',
    });

    expect(prisma.email).toBe('user@example.com');
    expect(prisma.username).toBe('playerOne');
    expect(prisma.passwordHash).toBe('hash');
  });
});
