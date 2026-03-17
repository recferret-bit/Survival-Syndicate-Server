import { Injectable, Logger } from '@nestjs/common';
import { ClickHousePortRepository } from '@app/collector-service/application/ports/clickhouse.port.repository';

/**
 * Stub implementation. Logs events instead of writing to ClickHouse.
 * Replace with real ClickHouse client in production.
 */
@Injectable()
export class ClickHouseStubRepository extends ClickHousePortRepository {
  private readonly logger = new Logger(ClickHouseStubRepository.name);

  async insert(table: string, data: Record<string, unknown>): Promise<void> {
    this.logger.debug(`[stub] insert into ${table}: ${JSON.stringify(data)}`);
  }

  async insertBatch(
    table: string,
    rows: Record<string, unknown>[],
  ): Promise<void> {
    this.logger.debug(`[stub] insert batch into ${table}: ${rows.length} rows`);
  }
}
