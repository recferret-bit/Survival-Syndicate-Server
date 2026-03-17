export interface AchievementProps {
  id: string;
  characterId: string;
  achievementId: string;
  completedAt: Date;
}

export type CreateAchievement = Omit<AchievementProps, 'id'>;
