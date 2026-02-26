import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileHandler } from './update-profile.handler';
import { UpdateProfileCommand } from './update-profile.command';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('UpdateProfileHandler (Unit)', () => {
  let handler: UpdateProfileHandler;
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
        UpdateProfileHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    handler = module.get<UpdateProfileHandler>(UpdateProfileHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update profile with name successfully', async () => {
      const userId = '12345';
      const newName = 'Updated Name';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: 'Old Name',
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: newName,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateProfileCommand(userId, { name: newName }),
      );

      expect(result.name).toBe(newName);
      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        name: newName,
      });
    });

    it('should update profile with birthday successfully', async () => {
      const userId = '12345';
      const birthday = '1990-01-01T00:00:00Z';
      const birthdayDate = new Date(birthday);
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        birthday: undefined,
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        birthday: birthdayDate,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateProfileCommand(userId, { birthday }),
      );

      expect(result.birthday).toBe(birthdayDate.toISOString());
      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        birthday: birthdayDate,
      });
    });

    it('should update profile with both name and birthday', async () => {
      const userId = '12345';
      const newName = 'Updated Name';
      const birthday = '1990-01-01T00:00:00Z';
      const birthdayDate = new Date(birthday);
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: 'Old Name',
        birthday: undefined,
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: newName,
        birthday: birthdayDate,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateProfileCommand(userId, { name: newName, birthday }),
      );

      expect(result.name).toBe(newName);
      expect(result.birthday).toBe(birthdayDate.toISOString());
      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        name: newName,
        birthday: birthdayDate,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '99999';
      const newName = 'Updated Name';

      userRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new UpdateProfileCommand(userId, { name: newName })),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findById).toHaveBeenCalledWith(99999);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should convert string userId to number for repository calls', async () => {
      const userId = '12345';
      const newName = 'Updated Name';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: newName,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      await handler.execute(
        new UpdateProfileCommand(userId, { name: newName }),
      );

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        name: newName,
      });
    });

    it('should handle undefined birthday in response', async () => {
      const userId = '12345';
      const newName = 'Updated Name';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: newName,
        birthday: undefined,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateProfileCommand(userId, { name: newName }),
      );

      expect(result.name).toBe(newName);
      expect(result.birthday).toBeUndefined();
    });

    it('should convert birthday string to Date object', async () => {
      const userId = '12345';
      const birthday = '1990-01-01T00:00:00Z';
      const birthdayDate = new Date(birthday);
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        birthday: birthdayDate,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      await handler.execute(new UpdateProfileCommand(userId, { birthday }));

      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        birthday: birthdayDate,
      });
    });

    it('should only update provided fields', async () => {
      const userId = '12345';
      const newName = 'Updated Name';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: 'Old Name',
        birthday: new Date('1980-01-01'),
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        name: newName,
        birthday: new Date('1980-01-01'), // Birthday unchanged
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new UpdateProfileCommand(userId, { name: newName }),
      );

      expect(result.name).toBe(newName);
      expect(userRepository.update).toHaveBeenCalledWith(12345, {
        name: newName,
      });
      // Birthday should not be in update call when not provided
      expect(userRepository.update).not.toHaveBeenCalledWith(
        12345,
        expect.objectContaining({ birthday: expect.anything() }),
      );
    });
  });
});
