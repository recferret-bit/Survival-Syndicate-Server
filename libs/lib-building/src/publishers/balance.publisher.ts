import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BalanceSubjects,
  CreateUserBalanceRequestSchema,
  CreateUserBalanceResponseSchema,
  CreateUserBalanceRequest,
  CreateUserBalanceResponse,
  AddBalanceEntryRequestSchema,
  AddBalanceEntryResponseSchema,
  AddBalanceEntryRequest,
  AddBalanceEntryResponse,
  GetUserBalanceRequestSchema,
  GetUserBalanceResponseSchema,
  GetUserBalanceRequest,
  GetUserBalanceResponse,
} from '../schemas/balance.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class BalancePublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, BalancePublisher.name);
  }

  /**
   * Create user balance
   */
  async createUserBalance(
    dto: CreateUserBalanceRequest,
  ): Promise<CreateUserBalanceResponse> {
    return this.sendNonDurable(
      BalanceSubjects.CREATE_USER_BALANCE,
      dto,
      CreateUserBalanceRequestSchema,
      CreateUserBalanceResponseSchema,
    );
  }

  /**
   * Add balance entry
   */
  async addBalanceEntry(
    dto: AddBalanceEntryRequest,
  ): Promise<AddBalanceEntryResponse> {
    return this.sendNonDurable(
      BalanceSubjects.ADD_BALANCE_ENTRY,
      dto,
      AddBalanceEntryRequestSchema,
      AddBalanceEntryResponseSchema,
    );
  }

  /**
   * Get user balance
   */
  async getUserBalance(
    dto: GetUserBalanceRequest,
  ): Promise<GetUserBalanceResponse> {
    return this.sendNonDurable(
      BalanceSubjects.GET_USER_BALANCE,
      dto,
      GetUserBalanceRequestSchema,
      GetUserBalanceResponseSchema,
    );
  }
}
