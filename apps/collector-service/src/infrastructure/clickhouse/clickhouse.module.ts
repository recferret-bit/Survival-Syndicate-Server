import { Module } from '@nestjs/common';
import { ClickHousePortRepository } from '@app/collector-service/application/ports/clickhouse.port.repository';
import { ClickHouseStubRepository } from './clickhouse.stub.repository';

@Module({
  providers: [
    {
      provide: ClickHousePortRepository,
      useClass: ClickHouseStubRepository,
    },
  ],
  exports: [ClickHousePortRepository],
})
export class ClickHouseModule {}
