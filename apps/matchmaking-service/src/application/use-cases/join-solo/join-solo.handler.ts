import { randomUUID } from 'crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUnavailableException } from '@nestjs/common';
import { GameServerPublisher } from '@lib/lib-game-server';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { JoinSoloCommand } from './join-solo.command';
import { JoinSoloResponseDto } from './join-solo.dto';

@CommandHandler(JoinSoloCommand)
export class JoinSoloHandler implements ICommandHandler<JoinSoloCommand> {
  constructor(
    private readonly zoneRegistry: ZoneRegistryPort,
    private readonly gameServerPublisher: GameServerPublisher,
  ) {}

  async execute(command: JoinSoloCommand): Promise<JoinSoloResponseDto> {
    const zone = await this.zoneRegistry.selectZone();
    if (!zone) {
      throw new ServiceUnavailableException('No available zones');
    }

    const matchId = randomUUID();
    const playerIds = [command.playerId];
    await this.gameServerPublisher.publishMatchmakingFoundMatch({
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
