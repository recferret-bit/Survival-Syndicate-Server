export interface BattlePassProps {
  id: string;
  characterId: string;
  seasonId: string;
  weaponsUnlocked: number;
  passivesUnlocked: number;
  activesUnlocked: number;
  updatedAt: Date;
}

export type CreateBattlePass = Omit<BattlePassProps, 'id' | 'updatedAt'> & {
  updatedAt?: Date;
};
