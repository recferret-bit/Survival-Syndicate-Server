import { randomUUID } from 'crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { JoinSoloCommand } from './join-solo.command';
import { JoinSoloResponseDto } from './join-solo.dto';
import { HttpServiceUnavailableException } from '@lib/shared/application';
import { MatchmakingPublisher } from '@lib/lib-matchmaking';

@CommandHandler(JoinSoloCommand)
export class JoinSoloHandler implements ICommandHandler<JoinSoloCommand> {
  constructor(
    private readonly zoneRegistry: ZoneRegistryPort,
    private readonly matchmakingPublisher: MatchmakingPublisher,
  ) {}

  async execute(command: JoinSoloCommand): Promise<JoinSoloResponseDto> {
    const zone = await this.zoneRegistry.selectZone();
    if (!zone) {
      throw new HttpServiceUnavailableException('No available zones');
    }

    const matchId = randomUUID();
    const playerIds = [command.playerId];
    await this.matchmakingPublisher.publishMatchmakingFoundMatch({
      matchId,
      zoneId: zone.zoneId,
      websocketUrl: zone.websocketUrl,
      playerIds,
    });

    return {
      matchId,
      zoneId: zone.zoneId,
      websocketUrl: zone.websocketUrl,
      playerIds,
    };
  }
}
