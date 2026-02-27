import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as Schemas from '../schemas/games.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class GameServerPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, GameServerPublisher.name);
  }

  async publishGameEvent(
    dto: Schemas.GameEventRequest,
  ): Promise<Schemas.GameEventResponse> {
    return this.sendNonDurable(
      Schemas.GameServerSubjects.GAME_EVENT,
      dto,
      Schemas.GameEventRequestSchema,
      Schemas.GameEventResponseSchema,
    );
  }

  async publishSessionEvent(
    dto: Schemas.SessionEventRequest,
  ): Promise<Schemas.SessionEventResponse> {
    return this.sendNonDurable(
      Schemas.GameServerSubjects.SESSION_EVENT,
      dto,
      Schemas.SessionEventRequestSchema,
      Schemas.SessionEventResponseSchema,
    );
  }

  async deleteCallbackOld(
    dto: Schemas.DeleteCallbackOldRequest,
  ): Promise<Schemas.DeleteCallbackOldResponse> {
    return this.sendNonDurable(
      Schemas.GameServerSubjects.DELETE_CALLBACK_OLD,
      dto,
      Schemas.DeleteCallbackOldRequestSchema,
      Schemas.DeleteCallbackOldResponseSchema,
    );
  }

  async addCallbackSlotegrator(
    dto: Schemas.AddCallbackSlotegratorRequest,
  ): Promise<Schemas.AddCallbackSlotegratorResponse> {
    return this.sendNonDurable(
      Schemas.GameServerSubjects.ADD_CALLBACK_SLOTEGRATOR,
      dto,
      Schemas.AddCallbackSlotegratorRequestSchema,
      Schemas.AddCallbackSlotegratorResponseSchema,
    );
  }

  async addCallbackPayment(
    dto: Schemas.AddCallbackPaymentRequest,
  ): Promise<Schemas.AddCallbackPaymentResponse> {
    return this.sendNonDurable(
      Schemas.GameServerSubjects.ADD_CALLBACK_PAYMENT,
      dto,
      Schemas.AddCallbackPaymentRequestSchema,
      Schemas.AddCallbackPaymentResponseSchema,
    );
  }

  /**
   * Publish bet placed event
   */
  async publishBetPlaced(
    dto: Schemas.BetPlacedRequest,
  ): Promise<Schemas.BetPlacedResponse> {
    const response = await this.sendNonDurable(
      Schemas.GameServerSubjects.BET_PLACED,
      dto,
      Schemas.BetPlacedRequestSchema,
      Schemas.BetPlacedResponseSchema,
    );

    if (!response) {
      this.logger.error(`Received undefined response from bonus service`, {
        dto,
      });
      throw new Error(
        'Bonus service did not return a valid response. The service may be unavailable or the request timed out.',
      );
    }

    try {
      return Schemas.BetPlacedResponseSchema.parse(response);
    } catch (error) {
      this.logger.error(`Invalid response format from bonus service`, {
        response,
        error,
      });
      throw new Error(
        `Bonus service returned an invalid response format: ${error.message}`,
      );
    }
  }

  /**
   * Get user stats from games service
   */
  async getUserStats(
    dto: Schemas.GetUserStatsRequest,
  ): Promise<Schemas.GetUserStatsResponse> {
    const response = await this.sendNonDurable(
      Schemas.GameServerSubjects.GET_USER_STATS,
      dto,
      Schemas.GetUserStatsRequestSchema,
      Schemas.GetUserStatsResponseSchema,
    );

    if (!response) {
      this.logger.error(`Received undefined response from games service`, {
        dto,
      });
      throw new Error(
        'Games service did not return a valid response. The service may be unavailable or the request timed out.',
      );
    }

    try {
      return Schemas.GetUserStatsResponseSchema.parse(response);
    } catch (error) {
      this.logger.error(`Invalid response format from games service`, {
        response,
        error,
      });
      throw new Error(
        `Games service returned an invalid response format: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Reset wager cycle for a user (sets wager_cycle_bet_amount to 0)
   */
  async resetWagerCycle(
    dto: Schemas.ResetWagerCycleRequest,
  ): Promise<Schemas.ResetWagerCycleResponse> {
    const response = await this.sendNonDurable(
      Schemas.GameServerSubjects.RESET_WAGER_CYCLE,
      dto,
      Schemas.ResetWagerCycleRequestSchema,
      Schemas.ResetWagerCycleResponseSchema,
    );

    if (!response) {
      this.logger.error(`Received undefined response from games service`, {
        dto,
      });
      throw new Error(
        'Games service did not return a valid response. The service may be unavailable or the request timed out.',
      );
    }

    try {
      return Schemas.ResetWagerCycleResponseSchema.parse(response);
    } catch (error) {
      this.logger.error(`Invalid response format from games service`, {
        response,
        error,
      });
      throw new Error(
        `Games service returned an invalid response format: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async publishMatchmakingFoundMatch(
    dto: Schemas.MatchmakingFoundMatchEvent,
  ): Promise<void> {
    await this.emitDurable(
      Schemas.GameServerSubjects.MATCHMAKING_FOUND_MATCH,
      dto,
      Schemas.MatchmakingFoundMatchEventSchema,
    );
  }
}
