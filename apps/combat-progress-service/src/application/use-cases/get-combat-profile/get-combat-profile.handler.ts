import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCombatProfileQuery } from './get-combat-profile.query';
import {
  type GetCombatProfileResponseDto,
  GetCombatProfileResponseSchema,
} from './get-combat-profile.dto';
import { PlayerProgressPortRepository } from '@app/combat-progress-service/application/ports/player-progress.port.repository';
import { BattlePassPortRepository } from '@app/combat-progress-service/application/ports/battle-pass.port.repository';
import { AchievementPortRepository } from '@app/combat-progress-service/application/ports/achievement.port.repository';

@QueryHandler(GetCombatProfileQuery)
export class GetCombatProfileHandler
  implements IQueryHandler<GetCombatProfileQuery, GetCombatProfileResponseDto>
{
  constructor(
    private readonly playerProgressRepository: PlayerProgressPortRepository,
    private readonly battlePassRepository: BattlePassPortRepository,
    private readonly achievementRepository: AchievementPortRepository,
  ) {}

  async execute(
    query: GetCombatProfileQuery,
  ): Promise<GetCombatProfileResponseDto> {
    const [progress, battlePasses, achievements] = await Promise.all([
      this.playerProgressRepository.findByCharacterId(query.characterId),
      this.battlePassRepository.findByCharacterId(query.characterId),
      this.achievementRepository.findByCharacterId(query.characterId),
    ]);

    const result = {
      characterId: query.characterId,
      progress: progress
        ? {
            level: progress.level,
            currentXp: progress.currentXp,
            totalXp: progress.totalXp,
          }
        : null,
      battlePasses: battlePasses.map((bp) => ({
        id: bp.id,
        seasonId: bp.seasonId,
        weaponsUnlocked: bp.weaponsUnlocked,
        passivesUnlocked: bp.passivesUnlocked,
        activesUnlocked: bp.activesUnlocked,
      })),
      achievements: achievements.map((a) => ({
        id: a.id,
        achievementId: a.achievementId,
        completedAt: a.completedAt.toISOString(),
      })),
    };

    return GetCombatProfileResponseSchema.parse(result);
  }
}
