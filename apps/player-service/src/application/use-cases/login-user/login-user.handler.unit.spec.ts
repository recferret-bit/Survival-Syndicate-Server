import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserHandler } from './login-user.handler';
import { LoginUserQuery } from './login-user.query';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { TrackingPortRepository } from '@app/player-service/application/ports/tracking.port.repository';
import { AuthJwtService } from '@lib/shared/auth';
import { EnvService, Utils } from '@lib/shared/application';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';

describe('LoginUserHandler', () => {
  let handler: LoginUserHandler;
  let userRepository: jest.Mocked<UserPortRepository>;
  let trackingRepository: jest.Mocked<TrackingPortRepository>;
  let authJwtService: jest.Mocked<AuthJwtService>;
  let envService: jest.Mocked<EnvService>;

  beforeEach(async () => {
    userRepository = {
      findByEmailOrPhone: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    trackingRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      updateLastIp: jest.fn(),
    } as any;

    authJwtService = {
      generateToken: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    envService = {
      get: jest.fn((key: string) => {
        if (key === 'PASSWORD_SECRET') return 'test-secret';
        return undefined;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
        {
          provide: TrackingPortRepository,
          useValue: trackingRepository,
        },
        {
          provide: AuthJwtService,
          useValue: authJwtService,
        },
        {
          provide: EnvService,
          useValue: envService,
        },
      ],
    }).compile();

    handler = module.get<LoginUserHandler>(LoginUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should login user successfully with email', async () => {
      const dto = UserFixtures.createLoginUserDto({ phone: undefined });
      const user = UserFixtures.createUser();
      const passwordHash = await Utils.GetHashFromPassword(
        'test-secret',
        dto.password,
      );
      const userWithPassword = UserFixtures.createUser({
        passwordHash,
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(userWithPassword);
      trackingRepository.updateLastIp.mockResolvedValue({} as any);
      authJwtService.generateToken.mockResolvedValue('jwt_token_123');

      const result = await handler.execute(
        new LoginUserQuery({ ...dto, ip: '127.0.0.1' }),
      );

      expect(result).toHaveProperty('token', 'jwt_token_123');
      expect(result.user).toHaveProperty('id', user.id.toString());
      expect(userRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        dto.email,
        undefined,
      );
      expect(trackingRepository.updateLastIp).toHaveBeenCalledWith(
        user.id,
        '127.0.0.1',
      );
    });

    it('should login user successfully with phone', async () => {
      const dto = UserFixtures.createLoginUserDto({ email: undefined });
      const passwordHash = await Utils.GetHashFromPassword(
        'test-secret',
        dto.password,
      );
      const user = UserFixtures.createUser({ passwordHash });

      userRepository.findByEmailOrPhone.mockResolvedValue(user);
      trackingRepository.updateLastIp.mockResolvedValue({} as any);
      authJwtService.generateToken.mockResolvedValue('jwt_token_123');

      const result = await handler.execute(
        new LoginUserQuery({ ...dto, ip: '127.0.0.1' }),
      );

      expect(result).toHaveProperty('token');
      expect(userRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        undefined,
        dto.phone,
      );
    });

    it('should reject login for non-existent user', async () => {
      const dto = UserFixtures.createLoginUserDto();

      userRepository.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        handler.execute(new LoginUserQuery({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(UnauthorizedException);

      expect(authJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should reject login for banned user', async () => {
      const dto = UserFixtures.createLoginUserDto();
      const bannedUser = UserFixtures.createBannedUser();

      userRepository.findByEmailOrPhone.mockResolvedValue(bannedUser);

      await expect(
        handler.execute(new LoginUserQuery({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(UnauthorizedException);

      expect(authJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should reject login with wrong password', async () => {
      const dto = UserFixtures.createLoginUserDto();
      const user = UserFixtures.createUser({
        passwordHash: 'wrong_hash',
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(user);

      await expect(
        handler.execute(new LoginUserQuery({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(UnauthorizedException);

      expect(authJwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should handle tracking update failure gracefully', async () => {
      const dto = UserFixtures.createLoginUserDto();
      const passwordHash = await Utils.GetHashFromPassword(
        'test-secret',
        dto.password,
      );
      const user = UserFixtures.createUser({ passwordHash });

      userRepository.findByEmailOrPhone.mockResolvedValue(user);
      trackingRepository.updateLastIp.mockRejectedValue(
        new Error('Tracking update failed'),
      );
      authJwtService.generateToken.mockResolvedValue('jwt_token_123');

      // Should still succeed even if tracking update fails
      const result = await handler.execute(
        new LoginUserQuery({ ...dto, ip: '127.0.0.1' }),
      );

      expect(result).toHaveProperty('token');
    });
  });
});
