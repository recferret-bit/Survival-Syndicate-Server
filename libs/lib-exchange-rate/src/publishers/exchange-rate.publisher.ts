import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ExchangeRateSubjects,
  GetExchangeRatesRequestSchema,
  GetExchangeRatesResponseSchema,
  EmptyResponseSchema,
  GetExchangeRatesRequest,
  GetExchangeRatesResponse,
  EmptyResponse,
} from '../schemas/exchange-rate.schemas';
import { BasePublisher } from '@lib/shared/nats';

@Injectable()
export class ExchangeRatePublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, ExchangeRatePublisher.name);
  }

  async getExchangeRates(
    dto: GetExchangeRatesRequest,
  ): Promise<GetExchangeRatesResponse> {
    return this.sendNonDurable(
      ExchangeRateSubjects.GET_EXCHANGE_RATES,
      dto,
      GetExchangeRatesRequestSchema,
      GetExchangeRatesResponseSchema,
    );
  }

  async runSetExchangeRates(): Promise<EmptyResponse> {
    return this.sendNonDurable(
      ExchangeRateSubjects.RUN_SET_EXCHANGE_RATES,
      {},
      undefined,
      EmptyResponseSchema,
    );
  }
}
