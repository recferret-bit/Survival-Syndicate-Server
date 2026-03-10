import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BasePublisher } from '@lib/shared/nats';
import {
  LocalOrchestratorSubjects,
  TestLocalOrchestratorRequest,
  TestLocalOrchestratorRequestSchema,
  TestLocalOrchestratorResponse,
  TestLocalOrchestratorResponseSchema,
} from '../schemas/local-orchestrator.schemas';

@Injectable()
export class LocalOrchestratorPublisher extends BasePublisher {
  constructor(
    @Inject('NATS_CLIENT') durableClient: ClientProxy,
    @Inject('NATS_CLIENT_NON_DURABLE') nonDurableClient: ClientProxy,
  ) {
    super(durableClient, nonDurableClient, LocalOrchestratorPublisher.name);
  }

  /**
   * test local orchestrator
   */
  async test(
    dto: TestLocalOrchestratorRequest,
  ): Promise<TestLocalOrchestratorResponse> {
    return this.sendNonDurable(
      LocalOrchestratorSubjects.TEST,
      dto,
      TestLocalOrchestratorRequestSchema,
      TestLocalOrchestratorResponseSchema,
    );
  }
}
