import { BattlePass } from '@app/combat-progress-service/domain/entities/battle-pass/battle-pass';
import { CreateBattlePass } from '@app/combat-progress-service/domain/entities/battle-pass/battle-pass.type';

export abstract class BattlePassPortRepository {
  abstract create(data: CreateBattlePass): Promise<BattlePass>;
  abstract findById(id: string): Promise<BattlePass | null>;
  abstract findByCharacterId(characterId: string): Promise<BattlePass[]>;
}
