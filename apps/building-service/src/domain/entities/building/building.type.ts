export interface BuildingProps {
  id: string;
  characterId: string;
  buildingId: string;
  level: number;
  slot: number;
  upgradedAt: Date;
}

export type CreateBuilding = Omit<BuildingProps, 'id' | 'upgradedAt'> & {
  upgradedAt?: Date;
};
