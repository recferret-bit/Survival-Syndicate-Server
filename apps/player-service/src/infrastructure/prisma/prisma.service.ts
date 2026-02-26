import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/meta';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { EnvService } from '@lib/shared';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(envService: EnvService) {
    const connectionString = envService.getUsersDatabaseUrl();
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
