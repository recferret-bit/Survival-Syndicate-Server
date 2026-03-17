import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BattlePassPortRepository } from '@app/combat-progress-service/application/ports/battle-pass.port.repository';
import { CreateBattlePass } from '@app/combat-progress-service/domain/entities/battle-pass/battle-pass.type';
import { BattlePass } from '@app/combat-progress-service/domain/entities/battle-pass/battle-pass';

@Injectable()
export class BattlePassInMemoryRepository extends BattlePassPortRepository {
  private readonly battlePasses = new Map<string, BattlePass>();

  async create(data: CreateBattlePass): Promise<BattlePass> {
    const now = new Date();
    const entity = new BattlePass({
      id: randomUUID(),
      characterId: data.characterId,
      seasonId: data.seasonId,
      weaponsUnlocked: data.weaponsUnlocked,
      passivesUnlocked: data.passivesUnlocked,
      activesUnlocked: data.activesUnlocked,
      updatedAt: data.updatedAt ?? now,
    });
    this.battlePasses.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<BattlePass | null> {
    return this.battlePasses.get(id) ?? null;
  }

  async findByCharacterId(characterId: string): Promise<BattlePass[]> {
    return Array.from(this.battlePasses.values()).filter(
      (bp) => bp.characterId === characterId,
    );
  }
}
