import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserPortRepository } from '@app/player-service/application/ports/user.port.repository';
import { TrackingPortRepository } from '@app/player-service/application/ports/tracking.port.repository';
import { AdminPortRepository } from '@app/player-service/application/ports/admin.port.repository';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { TrackingPrismaRepository } from './repositories/tracking.prisma.repository';
import { AdminPrismaRepository } from './repositories/admin.prisma.repository';
import { PlayerPrismaRepository } from './repositories/player.prisma.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: UserPortRepository,
      useClass: UserPrismaRepository,
    },
    {
      provide: TrackingPortRepository,
      useClass: TrackingPrismaRepository,
    },
    {
      provide: AdminPortRepository,
      useClass: AdminPrismaRepository,
    },
    {
      provide: PlayerPortRepository,
      useClass: PlayerPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    UserPortRepository,
    TrackingPortRepository,
    AdminPortRepository,
    PlayerPortRepository,
  ],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
