import { AuthUserPrismaMapper } from './auth-user.prisma.mapper';

describe('AuthUserPrismaMapper', () => {
  it('maps prisma entity to domain', () => {
    const domain = AuthUserPrismaMapper.toDomain({
      id: 1n,
      email: 'user@example.com',
      phone: null,
      passwordHash: 'hash',
      bearerTokenHash: null,
      name: 'playerOne',
      isTest: false,
      banned: false,
      banReason: null,
      banComment: null,
      banTime: null,
      country: null,
      languageIsoCode: 'en',
      currencyIsoCode: 'USD',
      birthday: null,
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
    expect(prisma.name).toBe('playerOne');
    expect(prisma.passwordHash).toBe('hash');
  });
});
