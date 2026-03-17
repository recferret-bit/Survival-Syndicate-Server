import 'dotenv/config';
import { defineConfig } from 'prisma/config';

type Database =
  | 'users'
  | 'gameplay'
  | 'local-orchestrator'
  | 'matchmaking'
  | 'player'
  | 'websocket';

/**
 * Add PgBouncer connection parameter if connecting via PgBouncer
 * PgBouncer in transaction mode requires pgbouncer=true parameter
 * This is automatically added if the URL contains port 6432 (PgBouncer default port)
 */
function ensurePgBouncerParam(url: string | undefined): string | undefined {
  if (!url) return url;

  // Check if URL is using PgBouncer port (6432)
  const isPgBouncer = url.includes(':6432/');

  if (isPgBouncer && !url.includes('pgbouncer=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}pgbouncer=true`;
  }

  return url;
}

const DATABASE_NAME_MAP: Record<Database, string> = {
  users: 'users_db',
  player: 'player_db',
  matchmaking: 'matchmaking_db',
  gameplay: 'gameplay_db',
  'local-orchestrator': 'local_orchestrator_db',
  websocket: 'websocket_db',
};

function getDatabaseUrl(
  database: Database,
  isLocal: boolean,
  useDirectForMigrate: boolean,
): string | undefined {
  const envKey = database.replace(/-/g, '_').toUpperCase();
  const directKey = `TEST_DIRECT_${envKey}_DATABASE_URL`;
  const pgbouncerKey = `PGBOUNCER_${envKey}_DATABASE_URL`;

  // Prefer direct connection for migrate dev: Prisma can auto-create shadow DB
  if (isLocal || useDirectForMigrate) {
    // When PRISMA_USE_TEST_DATABASES is set, use TEST_DIRECT_* (users_test etc.) for E2E
    if (process.env.PRISMA_USE_TEST_DATABASES === '1' || process.env.PRISMA_USE_TEST_DATABASES === 'true') {
      return process.env[directKey];
    }
    // When POSTGRES_BASE_URL is set, derive URL for migrate — same instance as ensure-dev-databases
    const baseUrl = process.env.POSTGRES_BASE_URL;
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        url.pathname = `/${DATABASE_NAME_MAP[database]}`;
        url.search = '';
        return url.toString();
      } catch {
        /* fall through to TEST_DIRECT */
      }
    }
    return process.env[directKey];
  }
  return ensurePgBouncerParam(process.env[pgbouncerKey]);
}

export function getPrismaConfig(database: Database) {
  const isLocal = process.env.NODE_ENV === 'local';
  const useDirectForMigrate =
    process.env.NODE_ENV !== 'production' &&
    process.env[`TEST_DIRECT_${database.replace(/-/g, '_').toUpperCase()}_DATABASE_URL`];

  const url = getDatabaseUrl(database, isLocal, !!useDirectForMigrate);

  if (!url) {
    const envKey = database.replace(/-/g, '_').toUpperCase();
    const varName =
      isLocal || useDirectForMigrate
        ? `TEST_DIRECT_${envKey}_DATABASE_URL`
        : `PGBOUNCER_${envKey}_DATABASE_URL`;
    throw new Error(`Environment variable ${varName} is not set.`);
  }

  const schemaDir = `./prisma/${database}`;
  // Omit shadowDatabaseUrl — Prisma auto-creates and drops shadow DB when using direct connection
  return defineConfig({
    schema: `${schemaDir}/schema.prisma`,
    migrations: {
      path: `${schemaDir}/migrations`,
    },
    datasource: {
      url,
    },
  });
}

// Export a default for CLI usage via environment variable
// When using --schema flag directly, Prisma may not use this config.
// When using --config ./prisma.config.ts, PRISMA_DB must be set (e.g. PRISMA_DB=users).
const database = process.env.PRISMA_DB as Database | undefined;
const validDb: Database[] = [
  'users',
  'gameplay',
  'local-orchestrator',
  'matchmaking',
  'player',
  'websocket',
];
export default database && validDb.includes(database)
  ? getPrismaConfig(database)
  : undefined;
