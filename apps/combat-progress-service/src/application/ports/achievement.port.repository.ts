import { Achievement } from '@app/combat-progress-service/domain/entities/achievement/achievement';
import { CreateAchievement } from '@app/combat-progress-service/domain/entities/achievement/achievement.type';

export abstract class AchievementPortRepository {
  abstract create(data: CreateAchievement): Promise<Achievement>;
  abstract findById(id: string): Promise<Achievement | null>;
  abstract findByCharacterId(characterId: string): Promise<Achievement[]>;
}
