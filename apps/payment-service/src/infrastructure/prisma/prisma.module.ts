import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
