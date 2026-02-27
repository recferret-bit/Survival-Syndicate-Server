import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { PrismaModule } from './prisma/prisma.module';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { LobbyInMemoryRepository } from '@app/matchmaking-service/infrastructure/repositories/lobby.in-memory.repository';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { ZoneRegistryInMemoryRepository } from '@app/matchmaking-service/infrastructure/repositories/zone-registry.in-memory.repository';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule],
  providers: [
    {
      provide: LobbyPortRepository,
      useClass: LobbyInMemoryRepository,
    },
    {
      provide: ZoneRegistryPort,
      useClass: ZoneRegistryInMemoryRepository,
    },
  ],
  exports: [PrismaModule, LobbyPortRepository, ZoneRegistryPort],
})
export class InfrastructureModule {}
