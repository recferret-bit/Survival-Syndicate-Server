import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  PlayerSubjects,
  TestPlayerRequest,
  TestPlayerRequestSchema,
  TestPlayerResponse,
  TestPlayerResponseSchema,
} from '../schemas/player.schemas';

@Injectable()
export class PlayerPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, PlayerPublisher.name);
  }

  /**
   * test player
   */
  async test(dto: TestPlayerRequest): Promise<TestPlayerResponse> {
    return this.sendNonDurable(
      PlayerSubjects.TEST,
      dto,
      TestPlayerRequestSchema,
      TestPlayerResponseSchema,
    );
  }
}
