import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { stringToBigNumber } from '@lib/shared';
import { CreateProfileCommand } from './create-profile.command';
import { CreateProfileResponseDto } from './create-profile.dto';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler
  implements ICommandHandler<CreateProfileCommand>
{
  constructor(private readonly playerRepository: PlayerPortRepository) {}

  async execute(
    command: CreateProfileCommand,
  ): Promise<CreateProfileResponseDto> {
    const { userId } = command.event;

    const existing = await this.playerRepository.findByUserId(userId);
    if (existing) {
      return {
        playerId: existing.id.toString(),
        userId: existing.userId.toString(),
        username: existing.username,
      };
    }

    const created = await this.playerRepository.create({
      userId: stringToBigNumber(userId),
      username: `player_${userId}`,
    });

    return {
      playerId: created.id.toString(),
      userId: created.userId.toString(),
      username: created.username,
    };
  }
}
