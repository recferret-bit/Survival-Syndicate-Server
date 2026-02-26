import { UserPrismaMapper } from './user.prisma.mapper';
import { User } from '@app/player-service/domain/entities/user/user';
import { BanReason } from '@app/player-service/domain/entities/user/user.type';
import { Prisma } from '@prisma/meta';
import BigNumber from 'bignumber.js';

// Mock Prisma User type structure
type MockPrismaUser = {
  id: bigint;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  name: string | null;
  isTest: boolean;
  banned: boolean;
  banReason: string | null;
  banComment: string | null;
  banTime: Date | null;
  country: string | null;
  languageIsoCode: string;
  currencyIsoCode: string;
  birthday: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

describe('UserPrismaMapper', () => {
  const createMockPrismaUser = (
    overrides?: Partial<MockPrismaUser>,
  ): MockPrismaUser => {
    return {
      id: 1n,
      email: 'test@example.com',
      phone: '+1234567890',
      passwordHash: 'hashed_password',
      name: 'Test User',
      isTest: false,
      banned: false,
      banReason: null,
      banComment: null,
      banTime: null,
      country: 'USA',
      languageIsoCode: 'en',
      currencyIsoCode: 'USD',
      birthday: new Date('1990-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('should map Prisma user to domain user with all fields', () => {
      const prismaUser = createMockPrismaUser();
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser).toBeInstanceOf(User);
      expect(domainUser.id).toEqual(new BigNumber(1));
      expect(domainUser.email).toBe('test@example.com');
      expect(domainUser.phone).toBe('+1234567890');
      expect(domainUser.passwordHash).toBe('hashed_password');
      expect(domainUser.name).toBe('Test User');
      expect(domainUser.isTest).toBe(false);
      expect(domainUser.banned).toBe(false);
      expect(domainUser.country).toBe('USA');
      expect(domainUser.languageIsoCode).toBe('en');
      expect(domainUser.currencyIsoCode).toBe('USD');
      expect(domainUser.birthday).toEqual(new Date('1990-01-01'));
      expect(domainUser.createdAt).toEqual(new Date('2024-01-01'));
      expect(domainUser.updatedAt).toEqual(new Date('2024-01-01'));
    });

    it('should convert null email to undefined', () => {
      const prismaUser = createMockPrismaUser({ email: null });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.email).toBeUndefined();
    });

    it('should convert null phone to undefined', () => {
      const prismaUser = createMockPrismaUser({ phone: null });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.phone).toBeUndefined();
    });

    it('should convert null name to undefined', () => {
      const prismaUser = createMockPrismaUser({ name: null });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.name).toBeUndefined();
    });

    it('should convert null country to undefined', () => {
      const prismaUser = createMockPrismaUser({ country: null });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.country).toBeUndefined();
    });

    it('should convert null birthday to undefined', () => {
      const prismaUser = createMockPrismaUser({ birthday: null });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.birthday).toBeUndefined();
    });

    it('should map banReason enum correctly', () => {
      const banReasons = [
        { prisma: 'fraud', domain: BanReason.fraud },
        { prisma: 'terms_violation', domain: BanReason.terms_violation },
        {
          prisma: 'suspicious_activity',
          domain: BanReason.suspicious_activity,
        },
        { prisma: 'manual', domain: BanReason.manual },
        { prisma: 'other', domain: BanReason.other },
      ];

      banReasons.forEach(({ prisma, domain }) => {
        const prismaUser = createMockPrismaUser({
          banned: true,
          banReason: prisma,
          banComment: 'Test ban',
          banTime: new Date(),
        });
        const domainUser = UserPrismaMapper.toDomain(
          prismaUser as Prisma.UserGetPayload<{}>,
        );

        expect(domainUser.banReason).toBe(domain);
        expect(domainUser.banned).toBe(true);
        expect(domainUser.banComment).toBe('Test ban');
        expect(domainUser.banTime).toBeInstanceOf(Date);
      });
    });

    it('should convert null banReason to undefined', () => {
      const prismaUser = createMockPrismaUser({
        banned: false,
        banReason: null,
      });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.banReason).toBeUndefined();
    });

    it('should convert null banComment to undefined', () => {
      const prismaUser = createMockPrismaUser({
        banned: true,
        banReason: 'fraud',
        banComment: null,
      });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.banComment).toBeUndefined();
    });

    it('should convert null banTime to undefined', () => {
      const prismaUser = createMockPrismaUser({
        banned: true,
        banReason: 'fraud',
        banTime: null,
      });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.banTime).toBeUndefined();
    });

    it('should handle user with only required fields', () => {
      const prismaUser = createMockPrismaUser({
        email: 'required@example.com', // At least email or phone is required
        phone: null,
        name: null,
        country: null,
        birthday: null,
        banReason: null,
        banComment: null,
        banTime: null,
      });
      const domainUser = UserPrismaMapper.toDomain(
        prismaUser as Prisma.UserGetPayload<{}>,
      );

      expect(domainUser.id).toEqual(new BigNumber(1));
      expect(domainUser.email).toBe('required@example.com');
      expect(domainUser.phone).toBeUndefined();
      expect(domainUser.name).toBeUndefined();
      expect(domainUser.country).toBeUndefined();
      expect(domainUser.birthday).toBeUndefined();
      expect(domainUser.passwordHash).toBe('hashed_password');
      expect(domainUser.languageIsoCode).toBe('en');
      expect(domainUser.currencyIsoCode).toBe('USD');
    });
  });

  describe('toPrisma', () => {
    it('should map domain user to Prisma input with all fields', () => {
      const createUser = {
        email: 'test@example.com',
        phone: '+1234567890',
        passwordHash: 'hashed_password',
        name: 'Test User',
        isTest: false,
        banned: false,
        country: 'USA',
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
        birthday: new Date('1990-01-01'),
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.email).toBe('test@example.com');
      expect(prismaInput.phone).toBe('+1234567890');
      expect(prismaInput.passwordHash).toBe('hashed_password');
      expect(prismaInput.name).toBe('Test User');
      expect(prismaInput.isTest).toBe(false);
      expect(prismaInput.banned).toBe(false);
      expect(prismaInput.country).toBe('USA');
      expect(prismaInput.languageIsoCode).toBe('en');
      expect(prismaInput.currencyIsoCode).toBe('USD');
      expect(prismaInput.birthday).toEqual(new Date('1990-01-01'));
    });

    it('should convert undefined email to null', () => {
      const createUser = {
        email: undefined,
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.email).toBeNull();
    });

    it('should convert undefined phone to null', () => {
      const createUser = {
        phone: undefined,
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.phone).toBeNull();
    });

    it('should convert undefined name to null', () => {
      const createUser = {
        name: undefined,
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.name).toBeNull();
    });

    it('should convert undefined country to null', () => {
      const createUser = {
        country: undefined,
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.country).toBeNull();
    });

    it('should convert undefined birthday to null', () => {
      const createUser = {
        birthday: undefined,
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.birthday).toBeNull();
    });

    it('should map banReason enum correctly', () => {
      const banTime = new Date('2024-01-01T12:00:00Z');
      const createUser = {
        passwordHash: 'hashed_password',
        isTest: false,
        banned: true,
        banReason: BanReason.fraud,
        banComment: 'Test ban',
        banTime,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.banned).toBe(true);
      expect(prismaInput.banReason).toBe(BanReason.fraud);
      expect(prismaInput.banComment).toBe('Test ban');
      expect(prismaInput.banTime).toEqual(banTime);
    });

    it('should convert undefined banReason to null', () => {
      const createUser = {
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        banReason: undefined,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.banReason).toBeNull();
    });

    it('should convert undefined banComment to null', () => {
      const createUser = {
        passwordHash: 'hashed_password',
        isTest: false,
        banned: true,
        banReason: BanReason.fraud,
        banComment: undefined,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.banComment).toBeNull();
    });

    it('should convert undefined banTime to null', () => {
      const createUser = {
        passwordHash: 'hashed_password',
        isTest: false,
        banned: true,
        banReason: BanReason.fraud,
        banTime: undefined,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.banTime).toBeNull();
    });

    it('should handle empty string email as null', () => {
      const createUser = {
        email: '',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.email).toBeNull();
    });

    it('should handle empty string phone as null', () => {
      const createUser = {
        phone: '',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const prismaInput = UserPrismaMapper.toPrisma(createUser);

      expect(prismaInput.phone).toBeNull();
    });
  });

  describe('toDomainList', () => {
    it('should map array of Prisma users to domain users', () => {
      const prismaUsers = [
        createMockPrismaUser({ id: 1n, email: 'user1@example.com' }),
        createMockPrismaUser({ id: 2n, email: 'user2@example.com' }),
        createMockPrismaUser({ id: 3n, email: 'user3@example.com' }),
      ];

      const domainUsers = UserPrismaMapper.toDomainList(
        prismaUsers as Prisma.UserGetPayload<{}>[],
      );

      expect(domainUsers).toHaveLength(3);
      expect(domainUsers[0]).toBeInstanceOf(User);
      expect(domainUsers[0].id).toEqual(new BigNumber(1));
      expect(domainUsers[0].email).toBe('user1@example.com');
      expect(domainUsers[1].id).toEqual(new BigNumber(2));
      expect(domainUsers[1].email).toBe('user2@example.com');
      expect(domainUsers[2].id).toEqual(new BigNumber(3));
      expect(domainUsers[2].email).toBe('user3@example.com');
    });

    it('should handle empty array', () => {
      const domainUsers = UserPrismaMapper.toDomainList([]);

      expect(domainUsers).toHaveLength(0);
      expect(Array.isArray(domainUsers)).toBe(true);
    });

    it('should preserve null/undefined conversions in list', () => {
      const prismaUsers = [
        createMockPrismaUser({ id: 1n, email: null, phone: '+1234567890' }), // At least one required
        createMockPrismaUser({ id: 2n, email: 'test@example.com' }),
      ];

      const domainUsers = UserPrismaMapper.toDomainList(
        prismaUsers as Prisma.UserGetPayload<{}>[],
      );

      expect(domainUsers[0].email).toBeUndefined();
      expect(domainUsers[0].phone).toBe('+1234567890');
      expect(domainUsers[1].email).toBe('test@example.com');
    });
  });
});
