import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  GetPlayerRequest,
  GetPlayerRequestSchema,
  GetPlayerResponse,
  GetPlayerResponseSchema,
  PlayerSubjects,
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
   * Get player by player ID
   */
  async getPlayer(dto: GetPlayerRequest): Promise<GetPlayerResponse> {
    return this.sendNonDurable(
      PlayerSubjects.GET_PLAYER,
      dto,
      GetPlayerRequestSchema,
      GetPlayerResponseSchema,
    );
  }
}
