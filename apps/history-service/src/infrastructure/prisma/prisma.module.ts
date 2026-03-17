import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MatchHistoryPortRepository } from '@app/history-service/application/ports/match-history.port.repository';
import { MatchHistoryInMemoryRepository } from './repositories/match-history.in-memory.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: MatchHistoryPortRepository,
      useClass: MatchHistoryInMemoryRepository,
    },
  ],
  exports: [PrismaService, MatchHistoryPortRepository],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
