import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from '@lib/shared/redis';
import { BalanceLockService } from './services/balance-lock.service';
import { BalanceRecalculationService } from './services/balance-recalculation.service';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [BalanceLockService, BalanceRecalculationService],
  exports: [PrismaModule, BalanceLockService, BalanceRecalculationService],
})
export class InfrastructureModule {}
