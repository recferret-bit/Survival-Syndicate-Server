import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from '@lib/shared/redis';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [],
  exports: [PrismaModule],
})
export class InfrastructureModule {}
