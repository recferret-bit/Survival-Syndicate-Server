export interface UpgradeProps {
  id: string;
  buildingId: string;
  characterId: string;
  fromLevel: number;
  toLevel: number;
  status: 'pending' | 'completed';
  createdAt: Date;
}

export type CreateUpgrade = Omit<UpgradeProps, 'id' | 'createdAt'> & {
  createdAt?: Date;
};
