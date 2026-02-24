import { Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaService } from '@app/balance/infrastructure/prisma/prisma.service';
import { BalanceLedgerPortRepository } from '@app/balance/application/ports/balance-ledger.port.repository';
import { BalanceResultPortRepository } from '@app/balance/application/ports/balance-result.port.repository';
import { UserBalancePortRepository } from '@app/balance/application/ports/user-balance.port.repository';
import { BalanceLedgerPrismaRepository } from '@app/balance/infrastructure/prisma/repositories/balance-ledger.prisma.repository';
import { BalanceResultPrismaRepository } from '@app/balance/infrastructure/prisma/repositories/balance-result.prisma.repository';
import { UserBalancePrismaRepository } from '@app/balance/infrastructure/prisma/repositories/user-balance.prisma.repository';
import { EnvModule } from '@lib/shared';

@Module({
  imports: [],
  providers: [
    PrismaService,
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
  ],
  exports: [
    PrismaService,
    BalanceLedgerPortRepository,
    BalanceResultPortRepository,
    UserBalancePortRepository,
  ],
})
export class PrismaModule implements OnApplicationShutdown {
  constructor(private readonly prismaService: PrismaService) {}

  async onApplicationShutdown() {
    await this.prismaService.$disconnect();
  }
}
