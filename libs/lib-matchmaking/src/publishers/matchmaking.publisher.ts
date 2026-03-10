import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  MatchmakingSubjects,
  TestMatchmakingRequest,
  TestMatchmakingRequestSchema,
  TestMatchmakingResponse,
  TestMatchmakingResponseSchema,
} from '../schemas/matchmaking.schemas';

@Injectable()
export class MatchmakingPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, MatchmakingPublisher.name);
  }

  /**
   * test matchmaking
   */
  async test(dto: TestMatchmakingRequest): Promise<TestMatchmakingResponse> {
    return this.sendNonDurable(
      MatchmakingSubjects.TEST,
      dto,
      TestMatchmakingRequestSchema,
      TestMatchmakingResponseSchema,
    );
  }
}
