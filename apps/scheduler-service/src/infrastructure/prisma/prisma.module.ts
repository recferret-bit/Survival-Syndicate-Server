import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ScheduledJobPortRepository } from '@app/scheduler-service/application/ports/scheduled-job.port.repository';
import { ScheduledJobInMemoryRepository } from './repositories/scheduled-job.in-memory.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: ScheduledJobPortRepository,
      useClass: ScheduledJobInMemoryRepository,
    },
  ],
  exports: [PrismaService, ScheduledJobPortRepository],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
