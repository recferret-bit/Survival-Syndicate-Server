import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  GameplayServiceHeartbeatEvent,
  GameplayServiceHeartbeatEventSchema,
  GameplaySubjects,
  MatchFinishedEvent,
  MatchFinishedEventSchema,
  WorldStateStub,
  WorldStateStubSchema,
} from '../schemas/gameplay.schemas';

@Injectable()
export class GameplayPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, GameplayPublisher.name);
  }

  async matchFinished(dto: MatchFinishedEvent): Promise<void> {
    return this.sendNonDurable(
      GameplaySubjects.MATCH_FINISHED,
      dto,
      MatchFinishedEventSchema,
    );
  }

  async publishGameplayServiceHeartbeat(
    dto: GameplayServiceHeartbeatEvent,
  ): Promise<void> {
    await this.emitDurable(
      GameplaySubjects.GAMEPLAY_SERVICE_HEARTBEAT,
      dto,
      GameplayServiceHeartbeatEventSchema,
    );
  }

  async publishWorldState(matchId: string, dto: WorldStateStub): Promise<void> {
    const subject = `${GameplaySubjects.GAMEPLAY_WORLD_STATE_PREFIX}.${matchId}`;
    await this.emitDurable(subject, dto, WorldStateStubSchema);
  }
}
