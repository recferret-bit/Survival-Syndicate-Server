import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PlayerProgressPortRepository } from '@app/combat-progress-service/application/ports/player-progress.port.repository';
import { CreatePlayerProgress } from '@app/combat-progress-service/domain/entities/player-progress/player-progress.type';
import { PlayerProgress } from '@app/combat-progress-service/domain/entities/player-progress/player-progress';

@Injectable()
export class PlayerProgressInMemoryRepository extends PlayerProgressPortRepository {
  private readonly progress = new Map<string, PlayerProgress>();

  async create(data: CreatePlayerProgress): Promise<PlayerProgress> {
    const now = new Date();
    const entity = new PlayerProgress({
      id: randomUUID(),
      characterId: data.characterId,
      level: data.level,
      currentXp: data.currentXp,
      totalXp: data.totalXp,
      updatedAt: data.updatedAt ?? now,
    });
    this.progress.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<PlayerProgress | null> {
    return this.progress.get(id) ?? null;
  }

  async findByCharacterId(characterId: string): Promise<PlayerProgress | null> {
    return (
      Array.from(this.progress.values()).find(
        (p) => p.characterId === characterId,
      ) ?? null
    );
  }
}
