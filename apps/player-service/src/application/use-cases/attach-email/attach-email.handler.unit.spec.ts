import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AttachEmailHandler } from './attach-email.handler';
import { AttachEmailCommand } from './attach-email.command';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import BigNumber from 'bignumber.js';

describe('AttachEmailHandler (Unit)', () => {
  let handler: AttachEmailHandler;
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
        AttachEmailHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    handler = module.get<AttachEmailHandler>(AttachEmailHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should attach email successfully', async () => {
      const userId = '12345';
      const email = 'newemail@example.com';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: undefined, // User without email
        phone: '+1234567890',
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email,
        phone: '+1234567890',
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(null); // Email not taken
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new AttachEmailCommand(userId, { email }),
      );

      expect(result.message).toBe('Email attached successfully');
      expect(result.email).toBe(email);
      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.update).toHaveBeenCalledWith(12345, { email });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '99999';
      const email = 'newemail@example.com';

      userRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new AttachEmailCommand(userId, { email })),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findById).toHaveBeenCalledWith(99999);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already has email', async () => {
      const userId = '12345';
      const email = 'newemail@example.com';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: 'existing@example.com', // User already has email
        phone: '+1234567890',
      });

      userRepository.findById.mockResolvedValue(user);

      await expect(
        handler.execute(new AttachEmailCommand(userId, { email })),
      ).rejects.toThrow(BadRequestException);
      await expect(
        handler.execute(new AttachEmailCommand(userId, { email })),
      ).rejects.toThrow('User already has an email address');

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email is already taken', async () => {
      const userId = '12345';
      const email = 'taken@example.com';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: undefined, // User without email
        phone: '+1234567890',
      });
      const existingUser = UserFixtures.createUser({
        id: new BigNumber(99999), // Different user
        email: 'taken@example.com',
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(existingUser); // Email already taken

      await expect(
        handler.execute(new AttachEmailCommand(userId, { email })),
      ).rejects.toThrow(ConflictException);
      await expect(
        handler.execute(new AttachEmailCommand(userId, { email })),
      ).rejects.toThrow('Email is already taken by another user');

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should convert string userId to number for repository calls', async () => {
      const userId = '12345';
      const email = 'newemail@example.com';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: undefined,
        phone: '+1234567890',
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email,
        phone: '+1234567890',
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      await handler.execute(new AttachEmailCommand(userId, { email }));

      expect(userRepository.findById).toHaveBeenCalledWith(12345);
      expect(userRepository.update).toHaveBeenCalledWith(12345, { email });
    });

    it('should handle user with only phone (no email)', async () => {
      const userId = '12345';
      const email = 'newemail@example.com';
      const user = UserFixtures.createUser({
        id: new BigNumber(12345),
        email: undefined,
        phone: '+1234567890',
      });
      const updatedUser = UserFixtures.createUser({
        id: new BigNumber(12345),
        email,
        phone: '+1234567890',
      });

      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await handler.execute(
        new AttachEmailCommand(userId, { email }),
      );

      expect(result.email).toBe(email);
      expect(user.email).toBeUndefined();
      expect(updatedUser.email).toBe(email);
    });
  });
});
