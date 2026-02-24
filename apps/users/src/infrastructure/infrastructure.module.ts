import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from '@lib/shared/redis';
import { UsersEventsStreamService } from './nats/users-events-stream.service';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule, RedisModule],
  providers: [UsersEventsStreamService],
  exports: [PrismaModule, RedisModule],
})
export class InfrastructureModule {}
