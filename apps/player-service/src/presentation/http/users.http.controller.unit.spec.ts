import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Reflector } from '@nestjs/core';
import { AuthJwtGuard } from '@lib/shared/auth';
import { UsersHttpController } from './users.http.controller';
import { RegisterUserCommand } from '@app/player-service/application/use-cases/register-user/register-user.command';
import { LoginUserQuery } from '@app/player-service/application/use-cases/login-user/login-user.query';
import { GetProfileQuery } from '@app/player-service/application/use-cases/get-profile/get-profile.query';
import { UserFixtures } from '@app/player-service/__fixtures__/user.fixtures';
import type { Request } from 'express';

describe('UsersHttpController (Unit)', () => {
  let controller: UsersHttpController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as any;

    queryBus = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersHttpController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
        },
        {
          provide: QueryBus,
          useValue: queryBus,
        },
        {
          provide: Reflector,
          useValue: new Reflector(),
        },
      ],
    })
      .overrideGuard(AuthJwtGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<UsersHttpController>(UsersHttpController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call commandBus.execute with RegisterUserCommand', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {},
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      } as unknown as Request;

      const expectedResponse = {
        token: 'jwt_token_123',
        user: {
          id: 1,
          email: dto.email,
          phone: dto.phone,
          currencyCode: dto.currencyIsoCode,
          languageCode: dto.languageIsoCode,
        },
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.register(dto, mockRequest);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(RegisterUserCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        statusCode: 200,
        data: expectedResponse,
      });
    });

    it('should extract IP from X-Forwarded-For header', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      commandBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.register(dto, mockRequest);

      const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(RegisterUserCommand);
      expect(callArgs.request.ip).toBe('192.168.1.1');
    });

    it('should extract IP from X-Real-IP header', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      commandBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.register(dto, mockRequest);

      const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(RegisterUserCommand);
      expect(callArgs.request.ip).toBe('192.168.1.2');
    });

    it('should fallback to request.ip if headers not present', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {},
        ip: '192.168.1.3',
      } as unknown as Request;

      commandBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.register(dto, mockRequest);

      const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(RegisterUserCommand);
      expect(callArgs.request.ip).toBe('192.168.1.3');
    });

    it('should fallback to socket.remoteAddress if ip not present', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {},
        socket: { remoteAddress: '192.168.1.4' },
      } as unknown as Request;

      commandBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.register(dto, mockRequest);

      const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(RegisterUserCommand);
      expect(callArgs.request.ip).toBe('192.168.1.4');
    });

    it('should use default IP if none available', async () => {
      const dto = UserFixtures.createRegisterUserDto() as any;
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      commandBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.register(dto, mockRequest);

      const callArgs = (commandBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(RegisterUserCommand);
      expect(callArgs.request.ip).toBe('0.0.0.0');
    });
  });

  describe('login', () => {
    it('should call queryBus.execute with LoginUserQuery', async () => {
      const dto = UserFixtures.createLoginUserDto();
      const mockRequest = {
        headers: {},
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
      } as unknown as Request;

      const expectedResponse = {
        token: 'jwt_token_123',
        user: {
          id: 1,
          email: dto.email,
          phone: dto.phone,
          currencyCode: 'USD',
          languageCode: 'en',
        },
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.login(dto, mockRequest);

      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(LoginUserQuery));
      expect(queryBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should extract IP from request for login', async () => {
      const dto = UserFixtures.createLoginUserDto();
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.5',
        },
        ip: '127.0.0.1',
      } as unknown as Request;

      queryBus.execute.mockResolvedValue({
        token: 'token',
        user: { id: 1 },
      });

      await controller.login(dto, mockRequest);

      const callArgs = (queryBus.execute as jest.Mock).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(LoginUserQuery);
      expect(callArgs.request.ip).toBe('192.168.1.5');
    });
  });

  describe('getProfile', () => {
    it('should call queryBus.execute with GetProfileQuery', async () => {
      const mockRequest = {
        session: {
          id: '12345',
        },
      } as any;

      const expectedResponse = {
        id: '12345',
        email: 'test@example.com',
        phone: '+1234567890',
        name: 'Test User',
        country: 'USA',
        languageIsoCode: 'en',
        currencyIsoCode: 'USD',
      };

      queryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getProfile(mockRequest);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '12345',
        }),
      );
      expect(queryBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getCurrencies', () => {
    it('should return list of currencies', async () => {
      const result = await controller.getCurrencies();

      expect(result).toHaveProperty('currencies');
      expect(Array.isArray(result.currencies)).toBe(true);
      expect(result.currencies.length).toBeGreaterThan(0);
      expect(result.currencies[0]).toHaveProperty('name');
      expect(result.currencies[0]).toHaveProperty('symbol');
      expect(result.currencies[0]).toHaveProperty('isoCode');
      expect(result.currencies[0]).toHaveProperty('isActive');
      expect(result.currencies[0]).toHaveProperty('decimals');
    });
  });

  describe('getLanguages', () => {
    it('should return list of languages', async () => {
      const result = await controller.getLanguages();

      expect(result).toHaveProperty('languages');
      expect(Array.isArray(result.languages)).toBe(true);
      expect(result.languages.length).toBeGreaterThan(0);
      expect(result.languages[0]).toHaveProperty('text');
      expect(result.languages[0]).toHaveProperty('languageCode');
      expect(result.languages[0]).toHaveProperty('isoCode');
      expect(result.languages[0]).toHaveProperty('isActive');
    });
  });
});
