import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { logNatsHandlerError, NonDurable } from '@lib/shared/nats';
import {
  GameplaySubjects,
  MatchFinishedEventSchema,
  type MatchFinishedEvent,
} from '@lib/lib-gameplay';
import { HandleMatchFinishedCommand } from '@app/history-service/application/use-cases/handle-match-finished/handle-match-finished.command';

@Controller()
export class HistoryNatsController {
  private readonly logger = new Logger(HistoryNatsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(GameplaySubjects.MATCH_FINISHED)
  @NonDurable()
  async handleMatchFinished(
    @Payload() data: MatchFinishedEvent,
  ): Promise<void> {
    try {
      const event = MatchFinishedEventSchema.parse(data);
      await this.commandBus.execute(new HandleMatchFinishedCommand(event));
    } catch (error) {
      logNatsHandlerError(this.logger, 'handleMatchFinished', error);
      throw error;
    }
  }
}
