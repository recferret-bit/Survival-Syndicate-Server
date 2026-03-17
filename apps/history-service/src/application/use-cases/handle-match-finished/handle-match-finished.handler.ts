import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { HandleMatchFinishedCommand } from './handle-match-finished.command';
import { MatchHistoryPortRepository } from '@app/history-service/application/ports/match-history.port.repository';

@CommandHandler(HandleMatchFinishedCommand)
export class HandleMatchFinishedHandler
  implements ICommandHandler<HandleMatchFinishedCommand>
{
  constructor(
    private readonly matchHistoryRepository: MatchHistoryPortRepository,
  ) {}

  async execute(command: HandleMatchFinishedCommand): Promise<void> {
    const { matchId } = command.event;
    const existing = await this.matchHistoryRepository.findByMatchId(matchId);
    if (existing) return;

    await this.matchHistoryRepository.create({
      matchId,
      finishedAt: new Date(),
    });
  }
}
