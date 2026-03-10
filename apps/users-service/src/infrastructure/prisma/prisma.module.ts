import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from '@app/users-service/infrastructure/prisma/prisma.service';
import { BalanceLedgerPortRepository } from '@app/users-service/application/ports/balance-ledger.port.repository';
import { BalanceResultPortRepository } from '@app/users-service/application/ports/balance-result.port.repository';
import { UserBalancePortRepository } from '@app/users-service/application/ports/user-balance.port.repository';
import { AuthUserPortRepository } from '@app/users-service/application/ports/auth-user.port.repository';
import { BalanceLedgerPrismaRepository } from '@app/users-service/infrastructure/prisma/repositories/balance-ledger.prisma.repository';
import { BalanceResultPrismaRepository } from '@app/users-service/infrastructure/prisma/repositories/balance-result.prisma.repository';
import { UserBalancePrismaRepository } from '@app/users-service/infrastructure/prisma/repositories/user-balance.prisma.repository';
import { AuthUserPrismaRepository } from '@app/users-service/infrastructure/prisma/repositories/auth-user.prisma.repository';
import { UsersPrismaService } from '@app/users-service/infrastructure/prisma/users-prisma.service';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [EnvModule.forRoot()],
  providers: [
    PrismaService,
    UsersPrismaService,
    {
      provide: BalanceLedgerPortRepository,
      useClass: BalanceLedgerPrismaRepository,
    },
    {
      provide: BalanceResultPortRepository,
      useClass: BalanceResultPrismaRepository,
    },
    {
      provide: UserBalancePortRepository,
      useClass: UserBalancePrismaRepository,
    },
    {
      provide: AuthUserPortRepository,
      useClass: AuthUserPrismaRepository,
    },
  ],
  exports: [
    PrismaService,
    UsersPrismaService,
    BalanceLedgerPortRepository,
    BalanceResultPortRepository,
    UserBalancePortRepository,
    AuthUserPortRepository,
  ],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
