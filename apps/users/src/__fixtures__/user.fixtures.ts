import { User } from '@app/users/domain/entities/user/user';
import {
  UserProps,
  BanReason,
} from '@app/users/domain/entities/user/user.type';
import {
  RegisterUserHttpDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from '@app/users/application/use-cases/register-user/register-user.dto';
import {
  LoginUserHttpDto,
  LoginUserResponseDto,
} from '@app/users/application/use-cases/login-user/login-user.dto';
import { Tracking } from '@app/users/domain/entities/tracking/tracking';
import { TrackingProps } from '@app/users/domain/entities/tracking/tracking.type';
import BigNumber from 'bignumber.js';

export class UserFixtures {
  static createUserProps(overrides?: Partial<UserProps>): UserProps {
    return {
      id: new BigNumber(1),
      email: 'test@example.com',
      phone: '+1234567890',
      passwordHash: 'hashed_password_123',
      name: 'Test User',
      isTest: false,
      banned: false,
      country: 'USA',
      languageIsoCode: 'en',
      currencyIsoCode: 'USD',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  static createUser(overrides?: Partial<UserProps>): User {
    return new User(this.createUserProps(overrides));
  }

  static createRegisterUserDto(
    overrides?: Partial<RegisterUserRequestDto>,
  ): RegisterUserRequestDto {
    return {
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'Password123!',
      currencyIsoCode: 'USD',
      languageIsoCode: 'en',
      country: 'USA',
      name: 'Test User',
      birthday: undefined,
      ...overrides,
    } as RegisterUserRequestDto;
  }

  static createLoginUserDto(
    overrides?: Partial<LoginUserHttpDto>,
  ): LoginUserHttpDto {
    return {
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'Password123!',
      ...overrides,
    };
  }

  static createRegisterUserResponseDto(
    overrides?: Partial<RegisterUserResponseDto>,
  ): RegisterUserResponseDto {
    return {
      token: 'jwt_token_123',
      user: {
        id: '1',
        email: 'test@example.com',
        phone: '+1234567890',
        currencyCode: 'USD',
        languageCode: 'en',
      },
      ...overrides,
    };
  }

  static createLoginUserResponseDto(
    overrides?: Partial<LoginUserResponseDto>,
  ): LoginUserResponseDto {
    return {
      token: 'jwt_token_123',
      user: {
        id: new BigNumber(1).toString(),
        email: 'test@example.com',
        phone: '+1234567890',
        currencyCode: 'USD',
        languageCode: 'en',
      },
      ...overrides,
    };
  }

  static createBannedUser(overrides?: Partial<UserProps>): User {
    return this.createUser({
      banned: true,
      banReason: BanReason.fraud,
      banComment: 'Fraudulent activity detected',
      banTime: new Date(),
      ...overrides,
    });
  }

  static createTestUser(overrides?: Partial<UserProps>): User {
    return this.createUser({
      isTest: true,
      ...overrides,
    });
  }

  static createTrackingProps(
    overrides?: Partial<TrackingProps>,
  ): TrackingProps {
    return {
      id: 1,
      userId: new BigNumber(1),
      firstIp: '127.0.0.1',
      lastIp: '127.0.0.1',
      ...overrides,
    };
  }

  static createTracking(overrides?: Partial<TrackingProps>): Tracking {
    return new Tracking(this.createTrackingProps(overrides));
  }
}
