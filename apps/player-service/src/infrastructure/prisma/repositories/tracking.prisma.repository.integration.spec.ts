import { Test, TestingModule } from '@nestjs/testing';
import { TrackingPortRepository } from '@app/users/application/ports/tracking.port.repository';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { PrismaService } from '../prisma.service';
import { InfrastructureModule } from '@app/users/infrastructure/infrastructure.module';
import { Tracking } from '@app/users/domain/entities/tracking/tracking';
import { bigNumberToBigInt } from '@lib/shared';
import BigNumber from 'bignumber.js';

describe('TrackingPrismaRepository (Integration)', () => {
  let repository: TrackingPortRepository;
  let userRepository: UserPortRepository;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    }).compile();

    repository = module.get<TrackingPortRepository>(TrackingPortRepository);
    userRepository = module.get<UserPortRepository>(UserPortRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test - delete tracking first due to foreign key constraints
    await prisma.tracking.deleteMany({});
    await prisma.user.deleteMany({});
  });

  const createTestUser = async () => {
    const user = await userRepository.create({
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashed_password',
      isTest: false,
      banned: false,
      languageIsoCode: 'en',
      currencyIsoCode: 'USD',
    });
    // Verify user was created successfully
    expect(user).toBeDefined();
    expect(user.id.toNumber()).toBeGreaterThan(0);
    // Verify user exists in database using repository
    const foundUser = await userRepository.findById(user.id.toNumber());
    expect(foundUser).toBeDefined();
    // Ensure user is committed and visible by querying directly with Prisma
    // This ensures the user is available for foreign key constraints
    const prismaUser = await prisma.user.findUnique({
      where: { id: bigNumberToBigInt(user.id) },
    });
    expect(prismaUser).toBeDefined();
    expect(prismaUser!.id).toEqual(bigNumberToBigInt(user.id));
    return user;
  };

  describe('create', () => {
    it('should create tracking with all fields', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '192.168.1.1',
        gaClientId: 'ga-123',
        yaClientId: 'ya-456',
        clickId: 'click-789',
        utmMedium: 'email',
        utmSource: 'newsletter',
        utmCampaign: 'summer-sale',
        pid: 'partner-123',
        sub1: 'sub1-value',
        sub2: 'sub2-value',
        sub3: 'sub3-value',
      };

      const tracking = await repository.create(createTracking);

      expect(tracking).toBeInstanceOf(Tracking);
      expect(tracking.id).toBeGreaterThan(0);
      expect(tracking.userId).toEqual(user.id);
      expect(tracking.firstIp).toBe('127.0.0.1');
      expect(tracking.lastIp).toBe('192.168.1.1');
      expect(tracking.gaClientId).toBe('ga-123');
      expect(tracking.yaClientId).toBe('ya-456');
      expect(tracking.clickId).toBe('click-789');
      expect(tracking.utmMedium).toBe('email');
      expect(tracking.utmSource).toBe('newsletter');
      expect(tracking.utmCampaign).toBe('summer-sale');
      expect(tracking.pid).toBe('partner-123');
      expect(tracking.sub1).toBe('sub1-value');
      expect(tracking.sub2).toBe('sub2-value');
      expect(tracking.sub3).toBe('sub3-value');
    });

    it('should create tracking with only required fields', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      };

      const tracking = await repository.create(createTracking);

      expect(tracking.userId).toEqual(user.id);
      expect(tracking.firstIp).toBe('127.0.0.1');
      expect(tracking.lastIp).toBe('127.0.0.1');
      expect(tracking.gaClientId).toBeUndefined();
      expect(tracking.yaClientId).toBeUndefined();
      expect(tracking.clickId).toBeUndefined();
    });

    it('should create tracking with partial optional fields', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: 'ga-only',
        utmSource: 'source-only',
      };

      const tracking = await repository.create(createTracking);

      expect(tracking.gaClientId).toBe('ga-only');
      expect(tracking.utmSource).toBe('source-only');
      expect(tracking.yaClientId).toBeUndefined();
      expect(tracking.clickId).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should find tracking by user id', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: 'find-test',
      };

      await repository.create(createTracking);
      const found = await repository.findByUserId(user.id);

      expect(found).toBeDefined();
      expect(found!.userId).toEqual(user.id);
      expect(found!.gaClientId).toBe('find-test');
    });

    it('should return null if tracking not found for user', async () => {
      const user = await createTestUser();

      const found = await repository.findByUserId(user.id);

      expect(found).toBeNull();
    });

    it('should return null for non-existent user id', async () => {
      const found = await repository.findByUserId(new BigNumber(99999));

      expect(found).toBeNull();
    });
  });

  describe('updateLastIp', () => {
    it('should update last IP address', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      };

      await repository.create(createTracking);

      const updated = await repository.updateLastIp(user.id, '192.168.1.100');

      expect(updated.lastIp).toBe('192.168.1.100');
      expect(updated.firstIp).toBe('127.0.0.1'); // Should remain unchanged
    });

    it('should update last IP multiple times', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      };

      await repository.create(createTracking);

      const updated1 = await repository.updateLastIp(user.id, '192.168.1.1');
      expect(updated1.lastIp).toBe('192.168.1.1');

      const updated2 = await repository.updateLastIp(user.id, '10.0.0.1');
      expect(updated2.lastIp).toBe('10.0.0.1');

      const updated3 = await repository.updateLastIp(user.id, '172.16.0.1');
      expect(updated3.lastIp).toBe('172.16.0.1');
    });

    it('should preserve optional fields when updating last IP', async () => {
      const user = await createTestUser();

      const createTracking = {
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: 'preserve-test',
        utmSource: 'preserve-source',
      };

      await repository.create(createTracking);

      const updated = await repository.updateLastIp(user.id, '192.168.1.1');

      expect(updated.lastIp).toBe('192.168.1.1');
      expect(updated.gaClientId).toBe('preserve-test');
      expect(updated.utmSource).toBe('preserve-source');
    });
  });

  describe('Integration with User', () => {
    it('should create tracking for existing user', async () => {
      const user = await createTestUser();

      const tracking = await repository.create({
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      });

      expect(tracking.userId).toEqual(user.id);

      // Verify user still exists
      const foundUser = await userRepository.findById(user.id.toNumber());
      expect(foundUser).toBeDefined();
    });

    it('should handle multiple trackings for different users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const tracking1 = await repository.create({
        userId: user1.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
        gaClientId: 'user1-ga',
      });

      const tracking2 = await repository.create({
        userId: user2.id,
        firstIp: '192.168.1.1',
        lastIp: '192.168.1.1',
        gaClientId: 'user2-ga',
      });

      expect(tracking1.userId).toEqual(user1.id);
      expect(tracking2.userId).toEqual(user2.id);

      const found1 = await repository.findByUserId(user1.id);
      const found2 = await repository.findByUserId(user2.id);

      expect(found1!.gaClientId).toBe('user1-ga');
      expect(found2!.gaClientId).toBe('user2-ga');
    });
  });
});
