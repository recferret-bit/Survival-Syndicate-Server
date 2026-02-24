import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  UsersSubjects,
  UpdateBannedUsersCacheRequestSchema,
  UpdateBannedUsersCacheResponseSchema,
  UpdateBannedUsersCacheRequest,
  UpdateBannedUsersCacheResponse,
  SyncActiveUsersCacheRequestSchema,
  SyncActiveUsersCacheResponseSchema,
  SyncActiveUsersCacheRequest,
  SyncActiveUsersCacheResponse,
  GetUserByIdRequestSchema,
  GetUserByIdResponseSchema,
  GetUserByIdRequest,
  GetUserByIdResponse,
  ValidateAdminApiKeyRequestSchema,
  ValidateAdminApiKeyResponseSchema,
  ValidateAdminApiKeyRequest,
  ValidateAdminApiKeyResponse,
  UserRegisteredEventSchema,
  UserRegisteredEvent,
} from '../schemas/users.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class UsersPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, UsersPublisher.name);
  }

  /**
   * Update banned users cache
   */
  async updateBannedUsersCache(
    dto: UpdateBannedUsersCacheRequest,
  ): Promise<UpdateBannedUsersCacheResponse> {
    return this.sendNonDurable(
      UsersSubjects.UPDATE_BANNED_USERS_CACHE,
      dto,
      UpdateBannedUsersCacheRequestSchema,
      UpdateBannedUsersCacheResponseSchema,
    );
  }

  /**
   * Sync active users cache
   */
  async syncActiveUsersCache(
    dto: SyncActiveUsersCacheRequest,
  ): Promise<SyncActiveUsersCacheResponse> {
    return this.sendNonDurable(
      UsersSubjects.SYNC_ACTIVE_USERS_CACHE,
      dto,
      SyncActiveUsersCacheRequestSchema,
      SyncActiveUsersCacheResponseSchema,
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(dto: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    return this.sendNonDurable(
      UsersSubjects.GET_USER_BY_ID,
      dto,
      GetUserByIdRequestSchema,
      GetUserByIdResponseSchema,
    );
  }

  /**
   * Validate admin API key
   */
  async validateAdminApiKey(
    dto: ValidateAdminApiKeyRequest,
  ): Promise<ValidateAdminApiKeyResponse> {
    return this.sendNonDurable(
      UsersSubjects.VALIDATE_ADMIN_API_KEY,
      dto,
      ValidateAdminApiKeyRequestSchema,
      ValidateAdminApiKeyResponseSchema,
    );
  }

  /**
   * Publish user registered event (fire-and-forget via JetStream)
   * Subscribers create empty UserStats for the new user
   */
  async publishUserRegistered(dto: UserRegisteredEvent): Promise<void> {
    await this.emitDurable(
      UsersSubjects.USER_REGISTERED,
      dto,
      UserRegisteredEventSchema,
    );
  }
}
