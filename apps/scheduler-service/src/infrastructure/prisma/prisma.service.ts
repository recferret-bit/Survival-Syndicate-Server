import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/scheduler';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { EnvService } from '@lib/shared';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  declare $transaction: PrismaClient['$transaction'];
  constructor(envService: EnvService) {
    const connectionString = envService.getSchedulerDatabaseUrl();
    if (!connectionString) {
      throw new Error(
        'SCHEDULER database URL not configured. Set PGBOUNCER_SCHEDULER_DATABASE_URL or TEST_DIRECT_SCHEDULER_DATABASE_URL.',
      );
    }
    const poolConfig = envService.getPoolConfig(connectionString);
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
