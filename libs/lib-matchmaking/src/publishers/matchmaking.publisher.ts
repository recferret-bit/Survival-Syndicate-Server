import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  MatchmakingFoundMatchEvent,
  MatchmakingFoundMatchEventSchema,
  MatchmakingSubjects,
} from '@lib/lib-matchmaking/schemas/matchmaking.schemas';

@Injectable()
export class MatchmakingPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, MatchmakingPublisher.name);
  }

  async publishMatchmakingFoundMatch(
    dto: MatchmakingFoundMatchEvent,
  ): Promise<void> {
    await this.emitDurable(
      MatchmakingSubjects.MATCHMAKING_FOUND_MATCH,
      dto,
      MatchmakingFoundMatchEventSchema,
    );
  }
}
