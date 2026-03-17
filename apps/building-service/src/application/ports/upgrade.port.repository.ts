import { Upgrade } from '@app/building-service/domain/entities/upgrade/upgrade';
import { CreateUpgrade } from '@app/building-service/domain/entities/upgrade/upgrade.type';

export abstract class UpgradePortRepository {
  abstract create(data: CreateUpgrade): Promise<Upgrade>;
  abstract findById(upgradeId: string): Promise<Upgrade | null>;
  abstract findByCharacterId(characterId: string): Promise<Upgrade[]>;
}
