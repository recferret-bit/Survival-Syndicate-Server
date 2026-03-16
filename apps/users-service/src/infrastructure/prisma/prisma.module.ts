import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from '@app/users-service/infrastructure/prisma/prisma.service';
import { AuthUserPortRepository } from '@app/users-service/application/ports/auth-user.port.repository';
import { AuthUserPrismaRepository } from '@app/users-service/infrastructure/prisma/repositories/auth-user.prisma.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: AuthUserPortRepository,
      useClass: AuthUserPrismaRepository,
    },
  ],
  exports: [PrismaService, AuthUserPortRepository],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
