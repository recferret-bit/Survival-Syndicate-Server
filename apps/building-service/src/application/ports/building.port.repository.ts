import { Building } from '@app/building-service/domain/entities/building/building';
import { CreateBuilding } from '@app/building-service/domain/entities/building/building.type';

export abstract class BuildingPortRepository {
  abstract create(data: CreateBuilding): Promise<Building>;
  abstract findById(id: string): Promise<Building | null>;
  abstract findByCharacterId(characterId: string): Promise<Building[]>;
}
