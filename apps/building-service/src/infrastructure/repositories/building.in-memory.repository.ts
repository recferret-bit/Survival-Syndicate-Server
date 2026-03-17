import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BuildingPortRepository } from '@app/building-service/application/ports/building.port.repository';
import { CreateBuilding } from '@app/building-service/domain/entities/building/building.type';
import { Building } from '@app/building-service/domain/entities/building/building';

@Injectable()
export class BuildingInMemoryRepository extends BuildingPortRepository {
  private readonly buildings = new Map<string, Building>();

  async create(data: CreateBuilding): Promise<Building> {
    const now = new Date();
    const building = new Building({
      id: randomUUID(),
      characterId: data.characterId,
      buildingId: data.buildingId,
      level: data.level,
      slot: data.slot,
      upgradedAt: data.upgradedAt ?? now,
    });
    this.buildings.set(building.id, building);
    return building;
  }

  async findById(id: string): Promise<Building | null> {
    return this.buildings.get(id) ?? null;
  }

  async findByCharacterId(characterId: string): Promise<Building[]> {
    return Array.from(this.buildings.values()).filter(
      (b) => b.characterId === characterId,
    );
  }
}
