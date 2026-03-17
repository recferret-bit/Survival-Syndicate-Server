import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BuildingPortRepository } from '@app/building-service/application/ports/building.port.repository';
import { UpgradePortRepository } from '@app/building-service/application/ports/upgrade.port.repository';
import { BuildingInMemoryRepository } from './repositories/building.in-memory.repository';
import { UpgradeInMemoryRepository } from './repositories/upgrade.in-memory.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    { provide: BuildingPortRepository, useClass: BuildingInMemoryRepository },
    { provide: UpgradePortRepository, useClass: UpgradeInMemoryRepository },
  ],
  exports: [PrismaService, BuildingPortRepository, UpgradePortRepository],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
