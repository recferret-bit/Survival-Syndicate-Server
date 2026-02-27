import { Player } from '@app/player-service/domain/entities/player/player';
import { CreatePlayer } from '@app/player-service/domain/entities/player/player.type';

export abstract class PlayerPortRepository {
  abstract create(data: CreatePlayer): Promise<Player>;
  abstract findById(playerId: string): Promise<Player | null>;
  abstract findByUserId(userId: string): Promise<Player | null>;
}
