import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AffiseSubjects,
  FirstDepositRequestSchema,
  EmptyResponseSchema,
  FirstDepositRequest,
  EmptyResponse,
} from '../schemas/affise.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class AffisePublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, AffisePublisher.name);
  }

  /**
   * Notify Affise about first deposit
   */
  async firstDeposit(dto: FirstDepositRequest): Promise<EmptyResponse> {
    return this.sendNonDurable(
      AffiseSubjects.FIRST_DEPOSIT,
      dto,
      FirstDepositRequestSchema,
      EmptyResponseSchema,
    );
  }

  /**
   * Trigger Affise data export
   */
  async runExportData(): Promise<EmptyResponse> {
    return this.sendNonDurable(
      AffiseSubjects.RUN_EXPORT_DATA,
      {},
      undefined,
      EmptyResponseSchema,
    );
  }
}
