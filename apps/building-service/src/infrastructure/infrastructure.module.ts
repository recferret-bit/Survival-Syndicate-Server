import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { BuildingPortRepository } from '@app/building-service/application/ports/building.port.repository';
import { UpgradePortRepository } from '@app/building-service/application/ports/upgrade.port.repository';
import { BuildingInMemoryRepository } from './repositories/building.in-memory.repository';
import { UpgradeInMemoryRepository } from './repositories/upgrade.in-memory.repository';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    { provide: BuildingPortRepository, useClass: BuildingInMemoryRepository },
    { provide: UpgradePortRepository, useClass: UpgradeInMemoryRepository },
  ],
  exports: [BuildingPortRepository, UpgradePortRepository],
})
export class InfrastructureModule {}
