import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AttachPhoneHandler } from './attach-phone.handler';
import { AttachPhoneCommand } from './attach-phone.command';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { UserFixtures } from '@app/users/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('AttachPhoneHandler (Unit)', () => {
  let handler: AttachPhoneHandler;
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
        AttachPhoneHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    handler = module.get<AttachPhoneHandler>(AttachPhoneHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should attach phone successfully', async () => {
      const userId = '12345';
      const phone = '+9876543210';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone: undefined, // User without phone
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByPhone.mockResolvedValue(null); // Phone not taken
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new AttachPhoneCommand(userId, { phone }),
      );

      expect(result.message).toBe('Phone attached successfully');
      expect(result.phone).toBe(phone);
      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(phone);
      expect(userRepository.update).toHaveBeenCalledWith(12345, { phone });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '99999';
      const phone = '+9876543210';

      userRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new AttachPhoneCommand(userId, { phone })),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findById).toHaveBeenCalledWith(99999);
      expect(userRepository.findByPhone).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already has phone', async () => {
      const userId = '12345';
      const phone = '+9876543210';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone: '+1234567890', // User already has phone
      });

      userRepository.findById.mockResolvedValue(user);

      await expect(
        handler.execute(new AttachPhoneCommand(userId, { phone })),
      ).rejects.toThrow(BadRequestException);
      await expect(
        handler.execute(new AttachPhoneCommand(userId, { phone })),
      ).rejects.toThrow('User already has a phone number');

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByPhone).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when phone is already taken', async () => {
      const userId = '12345';
      const phone = '+9876543210';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone: undefined, // User without phone
      });
      const existingUser = UserFixtures.createUser({
        id: new BigNumber(99999), // Different user
        phone: '+9876543210',
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByPhone.mockResolvedValue(existingUser); // Phone already taken

      await expect(
        handler.execute(new AttachPhoneCommand(userId, { phone })),
      ).rejects.toThrow(ConflictException);
      await expect(
        handler.execute(new AttachPhoneCommand(userId, { phone })),
      ).rejects.toThrow('Phone is already taken by another user');

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(phone);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should convert string userId to number for repository calls', async () => {
      const userId = '12345';
      const phone = '+9876543210';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone: undefined,
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      await handler.execute(new AttachPhoneCommand(userId, { phone }));

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.update).toHaveBeenCalledWith(12345, { phone });
    });

    it('should handle user with only email (no phone)', async () => {
      const userId = '12345';
      const phone = '+9876543210';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone: undefined,
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'test@example.com',
        phone,
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new AttachPhoneCommand(userId, { phone }),
      );

      expect(result.phone).toBe(phone);
      expect(user.phone).toBeUndefined();
      expect(updatedUser.phone).toBe(phone);
    });
  });
});
