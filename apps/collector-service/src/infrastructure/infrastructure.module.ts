import { Module } from '@nestjs/common';
import { ClickHouseModule } from './clickhouse/clickhouse.module';

@Module({
  imports: [ClickHouseModule],
  exports: [ClickHouseModule],
})
export class InfrastructureModule {}
