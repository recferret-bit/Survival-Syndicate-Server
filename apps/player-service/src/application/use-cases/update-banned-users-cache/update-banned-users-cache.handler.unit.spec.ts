import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBannedUsersCacheHandler } from './update-banned-users-cache.handler';
import { UpdateBannedUsersCacheCommand } from './update-banned-users-cache.command';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import {
  BannedUsersCacheService,
  BearerTokenHashCacheService,
} from '@lib/shared/redis';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('UpdateBannedUsersCacheHandler (Unit)', () => {
  let handler: UpdateBannedUsersCacheHandler;
  let userRepository: jest.Mocked<UserPortRepository>;
  let bannedUsersCacheService: jest.Mocked<BannedUsersCacheService>;
  let bearerTokenHashCacheService: jest.Mocked<BearerTokenHashCacheService>;

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

    bannedUsersCacheService = {
      updateCache: jest.fn(),
      isBanned: jest.fn(),
      addUser: jest.fn(),
      removeUser: jest.fn(),
      getAllBannedUsers: jest.fn(),
    } as any;

    bearerTokenHashCacheService = {
      setBearerTokenHash: jest.fn(),
      getBearerTokenHash: jest.fn(),
      removeBearerTokenHash: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBannedUsersCacheHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
        {
          provide: BannedUsersCacheService,
          useValue: bannedUsersCacheService,
        },
        {
          provide: BearerTokenHashCacheService,
          useValue: bearerTokenHashCacheService,
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
      bannedUsersCacheService.updateCache.mockResolvedValue(undefined);
      bearerTokenHashCacheService.removeBearerTokenHash.mockResolvedValue(
        undefined,
      );

      const result = await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(result).toEqual({
        success: true,
        bannedUsersCount: 2,
      });
      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(bannedUsersCacheService.updateCache).toHaveBeenCalledWith([
        '1',
        '2',
      ]);
      expect(
        bearerTokenHashCacheService.removeBearerTokenHash,
      ).toHaveBeenCalledTimes(2);
    });

    it('should update cache successfully with no banned users', async () => {
      userRepository.findAllBanned.mockResolvedValue([]);
      bannedUsersCacheService.updateCache.mockResolvedValue(undefined);

      const result = await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(result).toEqual({
        success: true,
        bannedUsersCount: 0,
      });
      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(bannedUsersCacheService.updateCache).toHaveBeenCalledWith([]);
      expect(
        bearerTokenHashCacheService.removeBearerTokenHash,
      ).not.toHaveBeenCalled();
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
      bannedUsersCacheService.updateCache.mockResolvedValue(undefined);
      bearerTokenHashCacheService.removeBearerTokenHash.mockResolvedValue(
        undefined,
      );

      await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(bannedUsersCacheService.updateCache).toHaveBeenCalledWith([
        '12345',
        '67890',
      ]);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      userRepository.findAllBanned.mockRejectedValue(error);

      await expect(
        handler.execute(new UpdateBannedUsersCacheCommand()),
      ).rejects.toThrow('Database connection failed');

      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(bannedUsersCacheService.updateCache).not.toHaveBeenCalled();
      expect(
        bearerTokenHashCacheService.removeBearerTokenHash,
      ).not.toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      const bannedUser = UserFixtures.createBannedUser({
        id: new BigNumber(1),
      });

      userRepository.findAllBanned.mockResolvedValue([bannedUser]);
      bannedUsersCacheService.updateCache.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        handler.execute(new UpdateBannedUsersCacheCommand()),
      ).rejects.toThrow('Redis connection failed');

      expect(userRepository.findAllBanned).toHaveBeenCalledTimes(1);
      expect(bannedUsersCacheService.updateCache).toHaveBeenCalledWith(['1']);
      expect(
        bearerTokenHashCacheService.removeBearerTokenHash,
      ).not.toHaveBeenCalled();
    });

    it('should remove bearer token hash for each banned user', async () => {
      const bannedUser = UserFixtures.createBannedUser({
        id: new BigNumber(1),
      });

      userRepository.findAllBanned.mockResolvedValue([bannedUser]);
      bannedUsersCacheService.updateCache.mockResolvedValue(undefined);
      bearerTokenHashCacheService.removeBearerTokenHash.mockResolvedValue(
        undefined,
      );

      await handler.execute(new UpdateBannedUsersCacheCommand());

      expect(bannedUsersCacheService.updateCache).toHaveBeenCalledWith(['1']);
      expect(
        bearerTokenHashCacheService.removeBearerTokenHash,
      ).toHaveBeenCalledWith('1');
    });
  });
});
