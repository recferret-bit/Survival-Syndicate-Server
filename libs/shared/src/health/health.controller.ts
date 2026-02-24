import { Controller, Get, Res } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
  HealthIndicatorFunction,
} from '@nestjs/terminus';
import { Response } from 'express';

// Generic PrismaClient type - accepts any Prisma client instance
type PrismaClientType = {
  $queryRaw: (query: any) => Promise<any>;
  $queryRawUnsafe: (query: string, ...values: any[]) => Promise<any>;
  [key: string]: any;
};

@Controller()
export class HealthController {
  private healthIndicators: HealthIndicatorFunction[] = [];

  // TODO add grpc and http health indicators
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {
    // 1 Gigabyte
    this.healthIndicators.push(() =>
      this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
    );
    this.healthIndicators.push(() =>
      this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
    );
  }

  public addPrismaIndicator(prismaClient: PrismaClientType) {
    this.healthIndicators.push(() =>
      this.prisma.pingCheck('prisma', prismaClient),
    );
  }

  @Get('health')
  @HealthCheck()
  ping() {
    const result = this.health.check(this.healthIndicators);
    return result;
  }
}
