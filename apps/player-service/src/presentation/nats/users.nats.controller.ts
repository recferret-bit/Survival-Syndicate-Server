import { Controller, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NonDurable } from '@lib/shared/nats';
import { ZodError } from 'zod';
import {
  PlayerSubjects,
  GetUserByIdRequestSchema,
  GetUserByIdResponseSchema,
  ValidateAdminApiKeyRequestSchema,
  ValidateAdminApiKeyResponseSchema,
} from '@lib/lib-player';
import type {
  GetUserByIdRequest,
  GetUserByIdResponse,
  ValidateAdminApiKeyRequest,
  ValidateAdminApiKeyResponse,
} from '@lib/lib-player';
import { UpdateBannedUsersCacheCommand } from '@app/player-service/application/use-cases/update-banned-users-cache/update-banned-users-cache.command';
import { UpdateBannedUsersCacheResponseDto } from '@app/player-service/application/use-cases/update-banned-users-cache/update-banned-users-cache.dto';
import { SyncActiveUsersCacheCommand } from '@app/player-service/application/use-cases/sync-active-users-cache/sync-active-users-cache.command';
import { SyncActiveUsersCacheResponseDto } from '@app/player-service/application/use-cases/sync-active-users-cache/sync-active-users-cache.dto';
import { GetUserByIdQuery } from '@app/player-service/application/use-cases/get-user-by-id/get-user-by-id.query';
import { ValidateAdminApiKeyQuery } from '@app/player-service/application/use-cases/validate-admin-api-key/validate-admin-api-key.query';

@Controller()
export class UsersNatsController {
  private readonly logger = new Logger(UsersNatsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(PlayerSubjects.UPDATE_BANNED_USERS_CACHE)
  @NonDurable()
  async handleUpdateBannedUsersCache(): Promise<UpdateBannedUsersCacheResponseDto> {
    try {
      this.logger.log('NATS request: update banned users cache');
      const result = await this.commandBus.execute(
        new UpdateBannedUsersCacheCommand(),
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error handling update banned users cache request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @MessagePattern(PlayerSubjects.SYNC_ACTIVE_USERS_CACHE)
  @NonDurable()
  async handleSyncActiveUsersCache(): Promise<SyncActiveUsersCacheResponseDto> {
    try {
      this.logger.log('NATS request: sync active users cache');
      const result = await this.commandBus.execute(
        new SyncActiveUsersCacheCommand(),
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error handling sync active users cache request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @MessagePattern(PlayerSubjects.GET_USER_BY_ID)
  @NonDurable()
  async handleGetUserById(
    @Payload() data: GetUserByIdRequest,
  ): Promise<GetUserByIdResponse> {
    try {
      // Validate request with zod schema
      const validatedRequest = GetUserByIdRequestSchema.parse(data);

      this.logger.log(
        `NATS request: get user by ID for userId: ${validatedRequest.userId}`,
      );

      // Call query handler
      const result = await this.queryBus.execute(
        new GetUserByIdQuery(validatedRequest.userId),
      );

      // Validate and return response
      return GetUserByIdResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Error handling get user by ID request: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Error handling get user by ID request: ${error.message}`,
          error.stack,
        );
      }
      // Re-throw the error so NestJS can handle it properly
      throw error;
    }
  }

  @MessagePattern(PlayerSubjects.VALIDATE_ADMIN_API_KEY)
  @NonDurable()
  async handleValidateAdminApiKey(
    @Payload() data: ValidateAdminApiKeyRequest,
  ): Promise<ValidateAdminApiKeyResponse> {
    try {
      // Validate request with zod schema
      const validatedRequest = ValidateAdminApiKeyRequestSchema.parse(data);

      this.logger.log('NATS request: validate admin API key');

      // Call query handler
      const result = await this.queryBus.execute(
        new ValidateAdminApiKeyQuery(validatedRequest.apiKey),
      );

      // Validate and return response
      return ValidateAdminApiKeyResponseSchema.parse(result);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `Error handling validate admin API key request: ${JSON.stringify(error.issues)}`,
        );
      } else {
        this.logger.error(
          `Error handling validate admin API key request: ${error.message}`,
          error.stack,
        );
      }
      // Re-throw the error so NestJS can handle it properly
      throw error;
    }
  }
}
