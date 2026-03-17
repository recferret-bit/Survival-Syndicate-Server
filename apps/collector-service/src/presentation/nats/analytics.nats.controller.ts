import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NonDurable, logNatsHandlerError } from '@lib/shared/nats';
import {
  CollectorSubjects,
  PublishEventRequestSchema,
  type PublishEventRequest,
} from '@lib/lib-collector';
import { ClickHousePortRepository } from '@app/collector-service/application/ports/clickhouse.port.repository';

const EVENTS_TABLE = 'events';

@Controller()
export class AnalyticsNatsController {
  private readonly logger = new Logger(AnalyticsNatsController.name);

  constructor(
    private readonly clickHouseRepository: ClickHousePortRepository,
  ) {}

  @EventPattern(CollectorSubjects.PUBLISH_EVENT)
  @NonDurable()
  async handlePublishEvent(
    @Payload() data: PublishEventRequest,
  ): Promise<void> {
    try {
      const parsed = PublishEventRequestSchema.safeParse(data);
      if (!parsed.success) {
        logNatsHandlerError(this.logger, 'handlePublishEvent', parsed.error);
        return;
      }

      const { eventType, payload } = parsed.data;
      await this.clickHouseRepository.insert(EVENTS_TABLE, {
        eventType,
        payload,
        receivedAt: new Date().toISOString(),
      });
    } catch (err) {
      logNatsHandlerError(this.logger, 'handlePublishEvent', err);
    }
  }
}
