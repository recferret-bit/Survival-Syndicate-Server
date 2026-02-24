import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CurrencyRateSubjects,
  GetRatesRequestSchema,
  GetRatesResponseSchema,
  GetRatesRequest,
  GetRatesResponse,
} from '../schemas/currency-rate.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class CurrencyRatePublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, CurrencyRatePublisher.name);
  }

  async getRates(request: GetRatesRequest): Promise<GetRatesResponse> {
    return this.sendNonDurable(
      CurrencyRateSubjects.GET_RATES,
      request,
      GetRatesRequestSchema,
      GetRatesResponseSchema,
    );
  }
}
