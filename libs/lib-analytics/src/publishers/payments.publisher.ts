import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AnalyticsSubjects,
  DepositCompletedRequestSchema,
  DepositCompletedResponseSchema,
  DepositCompletedRequest,
  DepositCompletedResponse,
} from '../schemas/payments.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class AnalyticsPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, AnalyticsPublisher.name);
  }

  /**
   * Publish deposit completed event
   */
  async publishDepositCompleted(
    dto: DepositCompletedRequest,
  ): Promise<DepositCompletedResponse> {
    const response = await this.sendNonDurable(
      AnalyticsSubjects.DEPOSIT_COMPLETED,
      dto,
      DepositCompletedRequestSchema,
      DepositCompletedResponseSchema,
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
      return DepositCompletedResponseSchema.parse(response);
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
}
