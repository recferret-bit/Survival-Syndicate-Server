import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PlayerProgressPortRepository } from '@app/combat-progress-service/application/ports/player-progress.port.repository';
import { BattlePassPortRepository } from '@app/combat-progress-service/application/ports/battle-pass.port.repository';
import { AchievementPortRepository } from '@app/combat-progress-service/application/ports/achievement.port.repository';
import { PlayerProgressInMemoryRepository } from './repositories/player-progress.in-memory.repository';
import { BattlePassInMemoryRepository } from './repositories/battle-pass.in-memory.repository';
import { AchievementInMemoryRepository } from './repositories/achievement.in-memory.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: PlayerProgressPortRepository,
      useClass: PlayerProgressInMemoryRepository,
    },
    {
      provide: BattlePassPortRepository,
      useClass: BattlePassInMemoryRepository,
    },
    {
      provide: AchievementPortRepository,
      useClass: AchievementInMemoryRepository,
    },
  ],
  exports: [
    PrismaService,
    PlayerProgressPortRepository,
    BattlePassPortRepository,
    AchievementPortRepository,
  ],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
