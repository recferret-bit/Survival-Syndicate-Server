import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/building';
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
    const connectionString = envService.getBuildingDatabaseUrl();
    if (!connectionString) {
      throw new Error(
        'BUILDING database URL not configured. Set PGBOUNCER_BUILDING_DATABASE_URL or TEST_DIRECT_BUILDING_DATABASE_URL.',
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
