import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserHandler } from './register-user.handler';
import { RegisterUserCommand } from './register-user.command';
import { UserPortRepository } from '@app/users/application/ports/user.port.repository';
import { TrackingPortRepository } from '@app/users/application/ports/tracking.port.repository';
import { AuthJwtService } from '@lib/shared/auth';
import { EnvService } from '@lib/shared/application';
import { BalancePublisher } from '@lib/lib-balance';
import { PrismaService } from '@app/users/infrastructure/prisma/prisma.service';
import { UserFixtures } from '@app/users/__fixtures__/user.fixtures';
import { Tracking } from '@app/users/domain/entities/tracking/tracking';
import { TrackingProps } from '@app/users/domain/entities/tracking/tracking.type';
import { UserPrismaMapper } from '@app/users/infrastructure/prisma/mapper/user.prisma.mapper';
import { TrackingPrismaMapper } from '@app/users/infrastructure/prisma/mapper/tracking.prisma.mapper';
import { bigNumberToBigInt } from '@lib/shared/utils/amount.utils';
import BigNumber from 'bignumber.js';

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let userRepository: jest.Mocked<UserPortRepository>;
  let trackingRepository: jest.Mocked<TrackingPortRepository>;
  let balancePublisher: jest.Mocked<BalancePublisher>;
  let authJwtService: jest.Mocked<AuthJwtService>;
  let envService: jest.Mocked<EnvService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    userRepository = {
      findByEmailOrPhone: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      update: jest.fn(),
    } as any;

    trackingRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      updateLastIp: jest.fn(),
    } as any;

    balancePublisher = {
      createUserBalance: jest.fn(),
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

    prismaService = {
      $transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserHandler,
        {
          provide: UserPortRepository,
          useValue: userRepository,
        },
        {
          provide: TrackingPortRepository,
          useValue: trackingRepository,
        },
        {
          provide: BalancePublisher,
          useValue: balancePublisher,
        },
        {
          provide: AuthJwtService,
          useValue: authJwtService,
        },
        {
          provide: EnvService,
          useValue: envService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = module.get<RegisterUserHandler>(RegisterUserHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should register user successfully', async () => {
      const dto = UserFixtures.createRegisterUserDto();
      const user = UserFixtures.createUser();
      const trackingProps: TrackingProps = {
        id: 1,
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      };
      const tracking = new Tracking(trackingProps);

      // Mock Prisma transaction
      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({
            id: bigNumberToBigInt(user.id),
            email: user.email,
            phone: user.phone,
            passwordHash: user.passwordHash,
            name: user.name,
            isTest: user.isTest,
            banned: user.banned,
            country: user.country,
            languageIsoCode: user.languageIsoCode,
            currencyIsoCode: user.currencyIsoCode,
            birthday: user.birthday,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            banReason: null,
            banComment: null,
            banTime: null,
          }),
        },
        tracking: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(null);
      authJwtService.generateToken.mockResolvedValue('jwt_token_123');
      balancePublisher.createUserBalance.mockResolvedValue({
        success: true,
        userId: user.id.toString(),
      });

      const result = await handler.execute(
        new RegisterUserCommand({ ...dto, ip: '127.0.0.1' }),
      );

      expect(result).toHaveProperty('token', 'jwt_token_123');
      expect(result.user).toHaveProperty('id', user.id.toString());
      expect(userRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        dto.email,
        dto.phone,
      );
      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.tracking.create).toHaveBeenCalled();
      expect(authJwtService.generateToken).toHaveBeenCalled();
      expect(balancePublisher.createUserBalance).toHaveBeenCalledWith({
        userId: user.id.toString(),
        currencyIsoCodes: [dto.currencyIsoCode],
      });
    });

    it('should reject duplicate email', async () => {
      const dto = UserFixtures.createRegisterUserDto();
      const existingUser = UserFixtures.createUser();

      userRepository.findByEmailOrPhone.mockResolvedValue(existingUser);

      await expect(
        handler.execute(new RegisterUserCommand({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should reject duplicate phone', async () => {
      const dto = UserFixtures.createRegisterUserDto({ email: undefined });
      const existingUser = UserFixtures.createUser();

      userRepository.findByEmailOrPhone.mockResolvedValue(existingUser);

      await expect(
        handler.execute(new RegisterUserCommand({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject invalid currency ISO code', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        currencyIsoCode: 'INVALID',
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        handler.execute(new RegisterUserCommand({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid language ISO code', async () => {
      const dto = UserFixtures.createRegisterUserDto({
        languageIsoCode: 'INVALID',
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        handler.execute(new RegisterUserCommand({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle balance creation failure gracefully', async () => {
      const dto = UserFixtures.createRegisterUserDto();
      const user = UserFixtures.createUser();
      const trackingProps: TrackingProps = {
        id: 1,
        userId: user.id,
        firstIp: '127.0.0.1',
        lastIp: '127.0.0.1',
      };
      const tracking = new Tracking(trackingProps);

      // Mock Prisma transaction
      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({
            id: bigNumberToBigInt(user.id),
            email: user.email,
            phone: user.phone,
            passwordHash: user.passwordHash,
            name: user.name,
            isTest: user.isTest,
            banned: user.banned,
            country: user.country,
            languageIsoCode: user.languageIsoCode,
            currencyIsoCode: user.currencyIsoCode,
            birthday: user.birthday,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            banReason: null,
            banComment: null,
            banTime: null,
          }),
        },
        tracking: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      userRepository.findByEmailOrPhone.mockResolvedValue(null);
      authJwtService.generateToken.mockResolvedValue('jwt_token_123');
      balancePublisher.createUserBalance.mockRejectedValue(
        new Error('Balance service unavailable'),
      );

      // Balance creation failure inside transaction will cause transaction to rollback
      await expect(
        handler.execute(new RegisterUserCommand({ ...dto, ip: '127.0.0.1' })),
      ).rejects.toThrow('Balance service unavailable');

      expect(balancePublisher.createUserBalance).toHaveBeenCalled();
    });
  });
});
