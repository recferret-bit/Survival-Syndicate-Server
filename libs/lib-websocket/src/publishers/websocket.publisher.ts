import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  WebsocketSubjects,
  TestWebsocketRequest,
  TestWebsocketRequestSchema,
  TestWebsocketResponse,
  TestWebsocketResponseSchema,
} from '../schemas/websocket.schemas';

@Injectable()
export class WebsocketPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, WebsocketPublisher.name);
  }

  /**
   * test websocket
   */
  async test(dto: TestWebsocketRequest): Promise<TestWebsocketResponse> {
    return this.sendNonDurable(
      WebsocketSubjects.TEST,
      dto,
      TestWebsocketRequestSchema,
      TestWebsocketResponseSchema,
    );
  }
}
