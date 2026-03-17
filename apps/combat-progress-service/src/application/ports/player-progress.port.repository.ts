import { PlayerProgress } from '@app/combat-progress-service/domain/entities/player-progress/player-progress';
import { CreatePlayerProgress } from '@app/combat-progress-service/domain/entities/player-progress/player-progress.type';

export abstract class PlayerProgressPortRepository {
  abstract create(data: CreatePlayerProgress): Promise<PlayerProgress>;
  abstract findById(id: string): Promise<PlayerProgress | null>;
  abstract findByCharacterId(
    characterId: string,
  ): Promise<PlayerProgress | null>;
}
