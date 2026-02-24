import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  DengageSubjects,
  PasswordRecoveryRequestSchema,
  EmptyResponseSchema,
  PasswordRecoveryRequest,
  EmptyResponse,
} from '../schemas/dengage.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class DengagePublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, DengagePublisher.name);
  }

  /**
   * Send password recovery email via Dengage
   */
  async passwordRecovery(dto: PasswordRecoveryRequest): Promise<EmptyResponse> {
    return this.sendNonDurable(
      DengageSubjects.PASSWORD_RECOVERY,
      dto,
      PasswordRecoveryRequestSchema,
      EmptyResponseSchema,
    );
  }

  /**
   * Trigger synchronization of contacts with Dengage
   */
  async runSyncContacts(): Promise<EmptyResponse> {
    return this.sendNonDurable(
      DengageSubjects.RUN_SYNC_CONTACTS,
      {},
      undefined,
      EmptyResponseSchema,
    );
  }
}
