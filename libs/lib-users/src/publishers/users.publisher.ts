import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  UsersSubjects,
  TestUsersRequest,
  TestUsersRequestSchema,
  TestUsersResponse,
  TestUsersResponseSchema,
} from '../schemas/users.schemas';

@Injectable()
export class UsersPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, UsersPublisher.name);
  }

  /**
   * test users
   */
  async test(dto: TestUsersRequest): Promise<TestUsersResponse> {
    return this.sendNonDurable(
      UsersSubjects.TEST,
      dto,
      TestUsersRequestSchema,
      TestUsersResponseSchema,
    );
  }
}
