import { User } from './user';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import { ValidationException } from '@lib/shared/application';
import { BanReason } from './user.type';
import BigNumber from 'bignumber.js';

describe('User Entity', () => {
  describe('Creation', () => {
    it('should create user with valid data', () => {
      const user = UserFixtures.createUser();
      expect(user.id).toEqual(new BigNumber(1));
      expect(user.email).toBe('test@example.com');
      expect(user.phone).toBe('+1234567890');
      expect(user.currencyIsoCode).toBe('USD');
      expect(user.languageIsoCode).toBe('en');
    });

    it('should create user with only email', () => {
      const user = UserFixtures.createUser({ phone: undefined });
      expect(user.email).toBe('test@example.com');
      expect(user.phone).toBeUndefined();
    });

    it('should create user with only phone', () => {
      const user = UserFixtures.createUser({ email: undefined });
      expect(user.email).toBeUndefined();
      expect(user.phone).toBe('+1234567890');
    });

    it('should reject user without email and phone', () => {
      expect(() => {
        UserFixtures.createUser({ email: undefined, phone: undefined });
      }).toThrow(ValidationException);
    });

    it('should reject user with empty password hash', () => {
      expect(() => {
        UserFixtures.createUser({ passwordHash: '' });
      }).toThrow(ValidationException);
    });

    it('should reject user with empty language ISO code', () => {
      expect(() => {
        UserFixtures.createUser({ languageIsoCode: '' });
      }).toThrow(ValidationException);
    });

    it('should reject user with empty currency ISO code', () => {
      expect(() => {
        UserFixtures.createUser({ currencyIsoCode: '' });
      }).toThrow(ValidationException);
    });
  });

  describe('Ban Management', () => {
    it('should check if user is banned', () => {
      const user = UserFixtures.createBannedUser();
      expect(user.isBanned()).toBe(true);
      expect(user.banned).toBe(true);
    });

    it('should check if user is not banned', () => {
      const user = UserFixtures.createUser();
      expect(user.isBanned()).toBe(false);
      expect(user.banned).toBe(false);
    });

    it('should ban user', () => {
      const user = UserFixtures.createUser();
      user.ban(BanReason.fraud, 'Fraudulent activity');

      expect(user.banned).toBe(true);
      expect(user.banReason).toBe(BanReason.fraud);
      expect(user.banComment).toBe('Fraudulent activity');
      expect(user.banTime).toBeInstanceOf(Date);
    });

    it('should unban user', () => {
      const user = UserFixtures.createBannedUser();
      user.unban();

      expect(user.banned).toBe(false);
      expect(user.banReason).toBeUndefined();
      expect(user.banComment).toBeUndefined();
      expect(user.banTime).toBeUndefined();
    });
  });

  describe('Test User Management', () => {
    it('should check if user is test user', () => {
      const user = UserFixtures.createTestUser();
      expect(user.isTestUser()).toBe(true);
      expect(user.isTest).toBe(true);
    });

    it('should set user as test user', () => {
      const user = UserFixtures.createUser();
      user.setTestUser(true);
      expect(user.isTest).toBe(true);
    });

    it('should set user as non-test user', () => {
      const user = UserFixtures.createTestUser();
      user.setTestUser(false);
      expect(user.isTest).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return all user properties correctly', () => {
      const user = UserFixtures.createUser({
        id: new BigNumber(123),
        email: 'user@test.com',
        phone: '+9876543210',
        name: 'John Doe',
        country: 'GB',
        birthday: new Date('1990-01-01'),
      });

      expect(user.id).toEqual(new BigNumber(123));
      expect(user.email).toBe('user@test.com');
      expect(user.phone).toBe('+9876543210');
      expect(user.name).toBe('John Doe');
      expect(user.country).toBe('GB');
      expect(user.birthday).toEqual(new Date('1990-01-01'));
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
});
