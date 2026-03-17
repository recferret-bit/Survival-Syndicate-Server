import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AchievementPortRepository } from '@app/combat-progress-service/application/ports/achievement.port.repository';
import { CreateAchievement } from '@app/combat-progress-service/domain/entities/achievement/achievement.type';
import { Achievement } from '@app/combat-progress-service/domain/entities/achievement/achievement';

@Injectable()
export class AchievementInMemoryRepository extends AchievementPortRepository {
  private readonly achievements = new Map<string, Achievement>();

  async create(data: CreateAchievement): Promise<Achievement> {
    const entity = new Achievement({
      id: randomUUID(),
      characterId: data.characterId,
      achievementId: data.achievementId,
      completedAt: data.completedAt,
    });
    this.achievements.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<Achievement | null> {
    return this.achievements.get(id) ?? null;
  }

  async findByCharacterId(characterId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      (a) => a.characterId === characterId,
    );
  }
}
