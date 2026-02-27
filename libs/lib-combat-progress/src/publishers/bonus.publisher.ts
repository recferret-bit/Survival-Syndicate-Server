import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as Schemas from '../schemas/bonus.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class CombatProgressPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, CombatProgressPublisher.name);
  }

  async createDepositBonus(
    dto: Schemas.CreateDepositBonusRequest,
  ): Promise<Schemas.CreateDepositBonusResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.CREATE_DEPOSIT_BONUS,
      dto,
      Schemas.CreateDepositBonusRequestSchema,
      Schemas.CreateDepositBonusResponseSchema,
    );
  }

  async decrementWager(
    dto: Schemas.DecrementWagerRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.DECREMENT_WAGER,
      dto,
      Schemas.DecrementWagerRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async deactivateBonusDeposit(
    dto: Schemas.UserIdRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.DEACTIVATE_BONUS_DEPOSIT,
      dto,
      Schemas.UserIdRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async bonusFreespinBet(
    dto: Schemas.BonusFreespinBetRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.BONUS_FREESPIN_BET,
      dto,
      Schemas.BonusFreespinBetRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async bonusFreespinWin(
    dto: Schemas.BonusFreespinWinRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.BONUS_FREESPIN_WIN,
      dto,
      Schemas.BonusFreespinWinRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async deactivateBonusFreespin(
    dto: Schemas.DeactivatedBonusFreespinRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.DEACTIVATE_BONUS_FREESPIN,
      dto,
      Schemas.DeactivatedBonusFreespinRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async checkActiveBonuses(
    dto: Schemas.UserIdRequest,
  ): Promise<Schemas.CheckActiveBonusesByUserIdResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.CHECK_ACTIVE_BONUSES,
      dto,
      Schemas.UserIdRequestSchema,
      Schemas.CheckActiveBonusesByUserIdResponseSchema,
    );
  }

  async selectBonus(
    dto: Schemas.SelectBonusRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.SELECT_BONUS,
      dto,
      Schemas.SelectBonusRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async receiveBonus(
    dto: Schemas.ReceiveBonusRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.RECEIVE_BONUS,
      dto,
      Schemas.ReceiveBonusRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }

  async getBonuses(
    dto: Schemas.GetBonusesRequest,
  ): Promise<Schemas.GetBonusesResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.GET_BONUSES,
      dto,
      Schemas.GetBonusesRequestSchema,
      Schemas.GetBonusesResponseSchema,
    );
  }

  async deleteSelectedBonus(
    dto: Schemas.DeleteSelectedBonusRequest,
  ): Promise<Schemas.EmptyResponse> {
    return this.sendNonDurable(
      Schemas.CombatProgressSubjects.DELETE_SELECTED_BONUS,
      dto,
      Schemas.DeleteSelectedBonusRequestSchema,
      Schemas.EmptyResponseSchema,
    );
  }
}
