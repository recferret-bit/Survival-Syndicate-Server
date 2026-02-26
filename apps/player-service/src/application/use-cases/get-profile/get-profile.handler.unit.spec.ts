import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProfileHandler } from './get-profile.handler';
import { GetProfileQuery } from './get-profile.query';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('GetProfileHandler (Unit)', () => {
  let handler: GetProfileHandler;
  let userRepository: jest.Mocked<UserPortRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    handler = module.get<GetProfileHandler>(GetProfileHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return user profile successfully', async () => {
      const userId = '12345';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
      });

      userRepository.findById.mockResolvedValue(user);

      const result = await handler.execute(new GetProfileQuery(userId));

      expect(result).toHaveProperty('id', '12345');
      expect(result).toHaveProperty('email', user.email);
      expect(result).toHaveProperty('phone', user.phone);
      expect(result).toHaveProperty('name', user.name);
      expect(result).toHaveProperty('country', user.country);
      expect(result).toHaveProperty('languageIsoCode', user.languageIsoCode);
      expect(result).toHaveProperty('currencyIsoCode', user.currencyIsoCode);
      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should return profile with birthday in ISO format', async () => {
      const userId = '12345';
      const birthday = new Date('1990-01-01T00:00:00Z');
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        birthday,
      });

      userRepository.findById.mockResolvedValue(user);

      const result = await handler.execute(new GetProfileQuery(userId));

      expect(result.birthday).toBe(birthday.toISOString());
    });

    it('should return profile with undefined birthday when not set', async () => {
      const userId = '12345';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        birthday: undefined,
      });

      userRepository.findById.mockResolvedValue(user);

      const result = await handler.execute(new GetProfileQuery(userId));

      expect(result.birthday).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '99999';

      userRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new GetProfileQuery(userId)),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findById).toHaveBeenCalledWith(99999);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should convert string userId to number for repository call', async () => {
      const userId = '12345';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
      });

      userRepository.findById.mockResolvedValue(user);

      await handler.execute(new GetProfileQuery(userId));

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
    });

    it('should handle user with only required fields', async () => {
      const userId = '12345';
      // User must have either email or phone, so we provide email but no optional fields
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        phone: undefined,
        name: undefined,
        country: undefined,
        birthday: undefined,
      });

      userRepository.findById.mockResolvedValue(user);

      const result = await handler.execute(new GetProfileQuery(userId));

      expect(result.email).toBeDefined();
      expect(result.phone).toBeUndefined();
      expect(result.name).toBeUndefined();
      expect(result.country).toBeUndefined();
      expect(result.birthday).toBeUndefined();
      expect(result.languageIsoCode).toBeDefined();
      expect(result.currencyIsoCode).toBeDefined();
    });
  });
});
