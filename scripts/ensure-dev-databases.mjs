#!/usr/bin/env node
/**
 * Ensure dev/test databases exist before Prisma migrate.
 * Creates databases if missing; Prisma can then auto-create shadow DB for migrate dev.
 *
 * Uses POSTGRES_BASE_URL (postgres DB) or derives from TEST_DIRECT_*_DATABASE_URL.
 */
import pg from 'pg';

const DEV_DATABASES = [
  'users_db',
  'player_db',
  'matchmaking_db',
  'gameplay_db',
  'local_orchestrator_db',
  'websocket_db',
  'building_db',
  'combat_progress_db',
  'scheduler_db',
  'collector_db',
  'payment_db',
  'history_db',
];

const TEST_DATABASES = [
  'users_test',
  'player_test',
  'matchmaking_test',
  'gameplay_test',
  'local_orchestrator_test',
  'websocket_test',
  'building_test',
  'combat_progress_test',
  'scheduler_test',
  'collector_test',
  'payment_test',
  'history_test',
];

function getBaseUrl() {
  const fromEnv = process.env.POSTGRES_BASE_URL;
  if (fromEnv) return fromEnv;

  const direct =
    process.env.TEST_DIRECT_USERS_DATABASE_URL ||
    process.env.PGBOUNCER_USERS_DATABASE_URL;
  if (direct) {
    try {
      const url = new URL(direct);
      url.pathname = '/postgres';
      url.search = '';
      return url.toString();
    } catch {
      /* fallback */
    }
  }
  return 'postgresql://postgres:postgres@localhost:5432/postgres';
}

async function ensureDatabase(client, dbName) {
  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );
  if (res.rows.length > 0) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Invalid database name: ${dbName}`);
  }
  await client.query(`CREATE DATABASE ${dbName}`);
  return true;
}

async function main() {
  const baseUrl = getBaseUrl();
  const client = new pg.Client({ connectionString: baseUrl });
  try {
    await client.connect();
    const all = [...new Set([...DEV_DATABASES, ...TEST_DATABASES])];
    for (const db of all) {
      const created = await ensureDatabase(client, db);
      console.log(created ? `  Created ${db}` : `  ${db} exists`);
    }
    console.log('Databases ready.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
