export interface PlayerProgressProps {
  id: string;
  characterId: string;
  level: number;
  currentXp: number;
  totalXp: number;
  updatedAt: Date;
}

export type CreatePlayerProgress = Omit<
  PlayerProgressProps,
  'id' | 'updatedAt'
> & {
  updatedAt?: Date;
};
