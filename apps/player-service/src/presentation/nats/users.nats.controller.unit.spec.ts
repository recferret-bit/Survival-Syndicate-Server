import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { UsersNatsController } from './users.nats.controller';
import { UpdateBannedUsersCacheCommand } from '@app/users/application/use-cases/update-banned-users-cache/update-banned-users-cache.command';
import { UpdateBannedUsersCacheResponseDto } from '@app/users/application/use-cases/update-banned-users-cache/update-banned-users-cache.dto';

describe('UsersNatsController (Unit)', () => {
  let controller: UsersNatsController;
  let commandBus: jest.Mocked<CommandBus>;

  beforeEach(async () => {
    commandBus = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersNatsController],
      providers: [
        {
          provide: CommandBus,
          useValue: commandBus,
        },
      ],
    }).compile();

    controller = module.get<UsersNatsController>(UsersNatsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUpdateBannedUsersCache', () => {
    it('should call commandBus.execute with UpdateBannedUsersCacheCommand', async () => {
      const expectedResponse: UpdateBannedUsersCacheResponseDto = {
        success: true,
        bannedUsersCount: 5,
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.handleUpdateBannedUsersCache();

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(UpdateBannedUsersCacheCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should return response from command handler', async () => {
      const expectedResponse: UpdateBannedUsersCacheResponseDto = {
        success: true,
        bannedUsersCount: 10,
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.handleUpdateBannedUsersCache();

      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(true);
      expect(result.bannedUsersCount).toBe(10);
    });

    it('should propagate errors from command handler', async () => {
      const error = new Error('Database connection failed');
      commandBus.execute.mockRejectedValue(error);

      await expect(controller.handleUpdateBannedUsersCache()).rejects.toThrow(
        'Database connection failed',
      );

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(UpdateBannedUsersCacheCommand),
      );
    });

    it('should handle empty banned users list', async () => {
      const expectedResponse: UpdateBannedUsersCacheResponseDto = {
        success: true,
        bannedUsersCount: 0,
      };

      commandBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.handleUpdateBannedUsersCache();

      expect(result).toEqual(expectedResponse);
      expect(result.bannedUsersCount).toBe(0);
    });
  });
});
