import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  GameplaySubjects,
  TestGameplayRequest,
  TestGameplayRequestSchema,
  TestGameplayResponse,
  TestGameplayResponseSchema,
} from '../schemas/gameplay.schemas';

@Injectable()
export class GameplayPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, GameplayPublisher.name);
  }

  /**
   * test gameplay
   */
  async test(dto: TestGameplayRequest): Promise<TestGameplayResponse> {
    return this.sendNonDurable(
      GameplaySubjects.TEST,
      dto,
      TestGameplayRequestSchema,
      TestGameplayResponseSchema,
    );
  }
}
