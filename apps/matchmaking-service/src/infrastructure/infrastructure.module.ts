import { Module } from '@nestjs/common';
import { EnvModule } from '@lib/shared/application';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [EnvModule.forRoot(), PrismaModule],
  exports: [PrismaModule],
})
export class InfrastructureModule {}
