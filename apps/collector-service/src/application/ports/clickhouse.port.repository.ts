/**
 * Port for inserting analytics events into ClickHouse.
 * No domain layer — works with raw event payloads.
 */
export abstract class ClickHousePortRepository {
  abstract insert(table: string, data: Record<string, unknown>): Promise<void>;

  abstract insertBatch(
    table: string,
    rows: Record<string, unknown>[],
  ): Promise<void>;
}
