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

function getDatabaseUrl(
  database: Database,
  isLocal: boolean,
): string | undefined {
  const envKey = database.replace(/-/g, '_').toUpperCase();
  const directKey = isLocal ? `TEST_DIRECT_${envKey}_DATABASE_URL` : null;
  const pgbouncerKey = `PGBOUNCER_${envKey}_DATABASE_URL`;

  return isLocal
    ? process.env[directKey ?? '']
    : ensurePgBouncerParam(process.env[pgbouncerKey]);
}

export function getPrismaConfig(database: Database) {
  const isLocal = process.env.NODE_ENV === 'local';
  const url = getDatabaseUrl(database, isLocal);

  if (!url) {
    const envKey = database.replace(/-/g, '_').toUpperCase();
    const varName = isLocal
      ? `TEST_DIRECT_${envKey}_DATABASE_URL`
      : `PGBOUNCER_${envKey}_DATABASE_URL`;
    throw new Error(`Environment variable ${varName} is not set.`);
  }

  const schemaDir = `./prisma/${database}`;
  const shadowDb = `postgresql://postgres:postgres@localhost:5432/${database.replace(/-/g, '_')}_shadow`;

  return defineConfig({
    schema: `${schemaDir}/schema.prisma`,
    migrations: {
      path: `${schemaDir}/migrations`,
    },
    datasource: {
      url,
      shadowDatabaseUrl: shadowDb,
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
