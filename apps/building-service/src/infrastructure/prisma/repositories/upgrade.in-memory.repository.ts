import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UpgradePortRepository } from '@app/building-service/application/ports/upgrade.port.repository';
import { CreateUpgrade } from '@app/building-service/domain/entities/upgrade/upgrade.type';
import { Upgrade } from '@app/building-service/domain/entities/upgrade/upgrade';

@Injectable()
export class UpgradeInMemoryRepository extends UpgradePortRepository {
  private readonly upgrades = new Map<string, Upgrade>();

  async create(data: CreateUpgrade): Promise<Upgrade> {
    const now = new Date();
    const upgrade = new Upgrade({
      id: randomUUID(),
      buildingId: data.buildingId,
      characterId: data.characterId,
      fromLevel: data.fromLevel,
      toLevel: data.toLevel,
      status: data.status,
      createdAt: data.createdAt ?? now,
    });
    this.upgrades.set(upgrade.id, upgrade);
    return upgrade;
  }

  async findById(upgradeId: string): Promise<Upgrade | null> {
    return this.upgrades.get(upgradeId) ?? null;
  }

  async findByCharacterId(characterId: string): Promise<Upgrade[]> {
    return Array.from(this.upgrades.values()).filter(
      (u) => u.characterId === characterId,
    );
  }
}
