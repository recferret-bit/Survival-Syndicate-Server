import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBannedUsersCacheHandler } from './update-banned-users-cache.handler';
import { UpdateBannedUsersCacheCommand } from './update-banned-users-cache.command';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { RedisService } from '@lib/shared/redis';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('UpdateBannedUsersCacheHandler (Unit)', () => {
  let handler: UpdateBannedUsersCacheHandler;
  let userRepository: jest.Mocked<UserPortRepository>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByEmailOrPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAllBanned: jest.fn(),
    } as any;

    redisService = {
      sremAll: jest.fn(),
      sadd: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBannedUsersCacheHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    handler = module.get<UpdateBannedUsersCacheHandler>(
      UpdateBannedUsersCacheHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update banned users cache successfully with banned users', async () => {
      const bannedUser1 = UserFixtures.createBannedUser({
        id: new BigNumber(1),
      });
      const bannedUser2 = UserFixtures.createBannedUser({
        id: new BigNumber(2),
      });
      const bannedUsers = [bannedUser1, bannedUser2];

      userRepository.findAllBanned.mockResolvedValue(bannedUsers);
      redisService.sremAll.mockResolvedValue(undefined);
      redisService.sadd.mockResolvedValue(2);

      const result = await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(result).toEqual({
        success: true,
        bannedUsersCount: 2,
      });
      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(redisService.sremAll).toHaveBeenCalledWith('banned:users');
      expect(redisService.sadd).toHaveBeenCalledWith('banned:users', '1', '2');
    });

    it('should update cache successfully with no banned users', async () => {
      userRepository.findAllBanned.mockResolvedValue([]);
      redisService.sremAll.mockResolvedValue(undefined);

      const result = await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(result).toEqual({
        success: true,
        bannedUsersCount: 0,
      });
      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(redisService.sremAll).toHaveBeenCalledWith('banned:users');
      expect(redisService.sadd).not.toHaveBeenCalled();
    });

    it('should convert user IDs to strings for cache', async () => {
      const bannedUser1 = UserFixtures.createBannedUser({
        id: new BigNumber(12345),
      });
      const bannedUser2 = UserFixtures.createBannedUser({
        id: new BigNumber(67890),
      });
      const bannedUsers = [bannedUser1, bannedUser2];

      userRepository.findAllBanned.mockResolvedValue(bannedUsers);
      redisService.sremAll.mockResolvedValue(undefined);
      redisService.sadd.mockResolvedValue(2);

      await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(redisService.sadd).toHaveBeenCalledWith(
        'banned:users',
        '12345',
        '67890',
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      userRepository.findAllBanned.mockRejectedValue(error);

      await expect(
        handler.execute(new UpdateBannedUsersCacheCommand()),
      ).rejects.toThrow('Database connection failed');

      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(redisService.sremAll).not.toHaveBeenCalled();
      expect(redisService.sadd).not.toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      const bannedUser = UserFixtures.createBannedUser({
        id: new BigNumber(1),
      });

      userRepository.findAllBanned.mockResolvedValue([bannedUser]);
      redisService.sremAll.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        handler.execute(new UpdateBannedUsersCacheCommand()),
      ).rejects.toThrow('Redis connection failed');

      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(redisService.sremAll).toHaveBeenCalledWith('banned:users');
      expect(redisService.sadd).not.toHaveBeenCalled();
    });

    it('should clear cache before populating', async () => {
      const bannedUser = UserFixtures.createBannedUser({
        id: new BigNumber(1),
      });

      userRepository.findAllBanned.mockResolvedValue([bannedUser]);
      redisService.sremAll.mockResolvedValue(undefined);
      redisService.sadd.mockResolvedValue(1);

      await handler.execute(new UpdateBannedUsersCacheCommand());

      // Verify order: sremAll is called before sadd
      const sremAllCallOrder = (redisService.sremAll as jest.Mock).mock
        .invocationCallOrder[0];
      const saddCallOrder = (redisService.sadd as jest.Mock).mock
        .invocationCallOrder[0];
      expect(sremAllCallOrder).toBeLessThan(saddCallOrder);
    });
  });
});
