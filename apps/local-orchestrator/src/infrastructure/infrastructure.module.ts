import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { PrismaModule } from '@app/matchmaking-service/infrastructure/prisma/prisma.module';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule],
  exports: [EnvModule, PrismaModule],
})
export class InfrastructureModule {}
