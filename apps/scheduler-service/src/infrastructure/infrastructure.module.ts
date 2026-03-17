import { Module } from '@nestjs/common';
import { QueuesModule } from './queues/queues.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [QueuesModule, PrismaModule],
  exports: [QueuesModule, PrismaModule],
})
export class InfrastructureModule {}
