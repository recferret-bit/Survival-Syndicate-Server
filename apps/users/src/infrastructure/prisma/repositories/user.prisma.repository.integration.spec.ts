import { Test, TestingModule } from '@nestjs/testing';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { PrismaService } from '../prisma.service';
import { InfrastructureModule } from '@app/users/infrastructure/infrastructure.module';
import { User } from '@app/users/domain/entities/user/user';
import { BanReason } from '@app/users/domain/entities/user/user.type';

describe('UserPrismaRepository (Integration)', () => {
  let repository: UserPortRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    repository = module.get<UserPortRepository>(UserPortRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.tracking.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('create', () => {
    it('should create a user with all fields', async () => {
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

      const user = await repository.create(createUser);

      expect(user).toBeInstanceOf(User);
      expect(user.id.toNumber()).toBeGreaterThan(0);
      expect(user.email).toBe('test@example.com');
      expect(user.phone).toBe('+1234567890');
      expect(user.name).toBe('Test User');
      expect(user.country).toBe('USA');
      expect(user.languageIsoCode).toBe('en');
      expect(user.currencyIsoCode).toBe('USD');
      expect(user.birthday).toEqual(new Date('1990-01-01'));
    });

    it('should create a user with only email', async () => {
      const createUser = {
        email: 'email-only@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const user = await repository.create(createUser);

      expect(user.email).toBe('email-only@example.com');
      expect(user.phone).toBeUndefined();
    });

    it('should create a user with only phone', async () => {
      const createUser = {
        phone: '+9876543210',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const user = await repository.create(createUser);

      expect(user.phone).toBe('+9876543210');
      expect(user.email).toBeUndefined();
    });

    it('should create a banned user with ban details', async () => {
      const createUser = {
        email: 'banned@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: true,
        banReason: BanReason.fraud,
        banComment: 'Fraudulent activity',
        banTime: new Date(),
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const user = await repository.create(createUser);

      expect(user.banned).toBe(true);
      expect(user.banReason).toBe(BanReason.fraud);
      expect(user.banComment).toBe('Fraudulent activity');
      expect(user.banTime).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const createUser = {
        email: 'findbyid@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      const created = await repository.create(createUser);
      // Convert BigNumber to number for repository call (port interface uses number)
      const found = await repository.findById(created.id.toNumber());

      expect(found).toBeDefined();
      expect(found!.id).toEqual(created.id);
      expect(found!.email).toBe('findbyid@example.com');
    });

    it('should return null if user not found', async () => {
      const found = await repository.findById(99999);

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const createUser = {
        email: 'findbyemail@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      await repository.create(createUser);
      const found = await repository.findByEmail('findbyemail@example.com');

      expect(found).toBeDefined();
      expect(found!.email).toBe('findbyemail@example.com');
    });

    it('should return null if email not found', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone', async () => {
      const createUser = {
        phone: '+1111111111',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      await repository.create(createUser);
      const found = await repository.findByPhone('+1111111111');

      expect(found).toBeDefined();
      expect(found!.phone).toBe('+1111111111');
    });

    it('should return null if phone not found', async () => {
      const found = await repository.findByPhone('+9999999999');

      expect(found).toBeNull();
    });
  });

  describe('findByEmailOrPhone', () => {
    it('should find user by email when email is provided', async () => {
      const createUser = {
        email: 'emailorphone1@example.com',
        phone: '+2222222222',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      await repository.create(createUser);
      const found = await repository.findByEmailOrPhone(
        'emailorphone1@example.com',
        undefined,
      );

      expect(found).toBeDefined();
      expect(found!.email).toBe('emailorphone1@example.com');
    });

    it('should find user by phone when phone is provided and email not found', async () => {
      const createUser = {
        email: 'emailorphone2@example.com',
        phone: '+3333333333',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      await repository.create(createUser);
      const found = await repository.findByEmailOrPhone(
        'nonexistent@example.com',
        '+3333333333',
      );

      expect(found).toBeDefined();
      expect(found!.phone).toBe('+3333333333');
    });

    it('should find user by phone when only phone is provided', async () => {
      const createUser = {
        phone: '+4444444444',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      await repository.create(createUser);
      const found = await repository.findByEmailOrPhone(
        undefined,
        '+4444444444',
      );

      expect(found).toBeDefined();
      expect(found!.phone).toBe('+4444444444');
    });

    it('should prioritize email over phone when both are provided', async () => {
      // Create user with email
      const user1 = await repository.create({
        email: 'priority@example.com',
        phone: '+5555555555',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      // Create another user with different email but same phone pattern
      await repository.create({
        email: 'other@example.com',
        phone: '+6666666666',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const found = await repository.findByEmailOrPhone(
        'priority@example.com',
        '+6666666666',
      );

      expect(found).toBeDefined();
      expect(found!.id).toEqual(user1.id);
      expect(found!.email).toBe('priority@example.com');
    });

    it('should return null when neither email nor phone match', async () => {
      const found = await repository.findByEmailOrPhone(
        'nonexistent@example.com',
        '+9999999999',
      );

      expect(found).toBeNull();
    });

    it('should return null when both email and phone are undefined', async () => {
      const found = await repository.findByEmailOrPhone(undefined, undefined);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user with partial data', async () => {
      const created = await repository.create({
        email: 'update@example.com',
        passwordHash: 'old_hash',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        email: 'updated@example.com',
        name: 'Updated Name',
        country: 'GB',
      });

      expect(updated.email).toBe('updated@example.com');
      expect(updated.name).toBe('Updated Name');
      expect(updated.country).toBe('GB');
      expect(updated.passwordHash).toBe('old_hash'); // Should remain unchanged
    });

    it('should update user email to null', async () => {
      // Create user with both email and phone so we can clear email
      const created = await repository.create({
        email: 'updatenull@example.com',
        phone: '+1234567890',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        email: undefined,
      });

      expect(updated.email).toBeUndefined();
      expect(updated.phone).toBe('+1234567890'); // Phone should remain
    });

    it('should update user phone to null', async () => {
      // Create user with both email and phone so we can clear phone
      const created = await repository.create({
        email: 'phoneupdate@example.com',
        phone: '+7777777777',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        phone: undefined,
      });

      expect(updated.phone).toBeUndefined();
      expect(updated.email).toBe('phoneupdate@example.com'); // Email should remain
    });

    it('should update user ban status', async () => {
      const created = await repository.create({
        email: 'banupdate@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        banned: true,
        banReason: BanReason.terms_violation,
        banComment: 'Violated terms',
        banTime: new Date(),
      });

      expect(updated.banned).toBe(true);
      expect(updated.banReason).toBe(BanReason.terms_violation);
      expect(updated.banComment).toBe('Violated terms');
      expect(updated.banTime).toBeInstanceOf(Date);
    });

    it('should unban user', async () => {
      const created = await repository.create({
        email: 'unban@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: true,
        banReason: BanReason.fraud,
        banComment: 'Fraud',
        banTime: new Date(),
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        banned: false,
        banReason: undefined,
        banComment: undefined,
        banTime: undefined,
      });

      expect(updated.banned).toBe(false);
      expect(updated.banReason).toBeUndefined();
      expect(updated.banComment).toBeUndefined();
      expect(updated.banTime).toBeUndefined();
    });

    it('should update password hash', async () => {
      const created = await repository.create({
        email: 'password@example.com',
        passwordHash: 'old_hash',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        passwordHash: 'new_hash',
      });

      expect(updated.passwordHash).toBe('new_hash');
    });

    it('should update multiple fields at once', async () => {
      const created = await repository.create({
        email: 'multifield@example.com',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        name: 'Multi Field',
        country: 'CA',
        languageIsoCode: 'fr',
        currencyIsoCode: 'CAD',
        birthday: new Date('1985-05-15'),
        isTest: true,
      });

      expect(updated.name).toBe('Multi Field');
      expect(updated.country).toBe('CA');
      expect(updated.languageIsoCode).toBe('fr');
      expect(updated.currencyIsoCode).toBe('CAD');
      expect(updated.birthday).toEqual(new Date('1985-05-15'));
      expect(updated.isTest).toBe(true);
    });

    it('should handle empty string as null for optional fields', async () => {
      const created = await repository.create({
        email: 'emptystring@example.com',
        phone: '+1234567890',
        name: 'Original Name',
        passwordHash: 'hashed_password',
        isTest: false,
        banned: false,
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      });

      const updated = await repository.update(created.id.toNumber(), {
        email: '',
        name: '',
      });

      expect(updated.email).toBeUndefined();
      expect(updated.name).toBeUndefined();
      // Phone should still exist since we need at least email or phone
      expect(updated.phone).toBe('+1234567890');
    });
  });
});
