import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from '@lib/shared/redis';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule, RedisModule],
  providers: [],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
