import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { PlayerPrismaRepository } from './repositories/player.prisma.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: PlayerPortRepository,
      useClass: PlayerPrismaRepository,
    },
  ],
  exports: [PrismaService, PlayerPortRepository],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
