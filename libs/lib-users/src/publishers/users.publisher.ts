import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  UsersSubjects,
  UserRegisteredEvent,
  UserRegisteredEventSchema,
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
