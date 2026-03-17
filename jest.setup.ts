process.env.NODE_ENV = 'local';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (!process.env.NATS_SERVERS) {
  process.env.NATS_SERVERS = 'nats://localhost:4222';
}

if (!process.env.PROJECT) {
  process.env.PROJECT = 'survival-syndicate';
}
if (!process.env.DO_CA) {
  process.env.DO_CA = '';
}
if (!process.env.NATS_USER) {
  process.env.NATS_USER = '';
}
if (!process.env.NATS_PASSWORD) {
  process.env.NATS_PASSWORD = '';
}
if (!process.env.NATS_TOKEN) {
  process.env.NATS_TOKEN = '';
}
if (!process.env.MAX_LOG_LENGTH) {
  process.env.MAX_LOG_LENGTH = '1000';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key';
}
if (!process.env.PASSWORD_SECRET) {
  process.env.PASSWORD_SECRET = 'test-password-secret';
}

// Base URL for DB creation (ensure-dev-databases) — default for local dev
if (!process.env.POSTGRES_BASE_URL) {
  process.env.POSTGRES_BASE_URL =
    'postgresql://postgres:postgres@localhost:5432/postgres';
}

// Survival Syndicate — PgBouncer URLs (when running with full stack)
if (!process.env.PGBOUNCER_USERS_DATABASE_URL) {
  process.env.PGBOUNCER_USERS_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/users_db';
}
if (!process.env.PGBOUNCER_PLAYER_DATABASE_URL) {
  process.env.PGBOUNCER_PLAYER_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/player_db';
}
if (!process.env.PGBOUNCER_MATCHMAKING_DATABASE_URL) {
  process.env.PGBOUNCER_MATCHMAKING_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/matchmaking_db';
}
if (!process.env.PGBOUNCER_GAMEPLAY_DATABASE_URL) {
  process.env.PGBOUNCER_GAMEPLAY_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/gameplay_db';
}
if (!process.env.PGBOUNCER_LOCAL_ORCHESTRATOR_DATABASE_URL) {
  process.env.PGBOUNCER_LOCAL_ORCHESTRATOR_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/local_orchestrator_db';
}
if (!process.env.PGBOUNCER_WEBSOCKET_DATABASE_URL) {
  process.env.PGBOUNCER_WEBSOCKET_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:6432/websocket_db';
}

// Survival Syndicate — direct test URLs (unit/integration/E2E)
if (!process.env.TEST_DIRECT_USERS_DATABASE_URL) {
  process.env.TEST_DIRECT_USERS_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/users_test';
}
if (!process.env.TEST_DIRECT_PLAYER_DATABASE_URL) {
  process.env.TEST_DIRECT_PLAYER_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/player_test';
}
if (!process.env.TEST_DIRECT_MATCHMAKING_DATABASE_URL) {
  process.env.TEST_DIRECT_MATCHMAKING_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/matchmaking_test';
}
if (!process.env.TEST_DIRECT_GAMEPLAY_DATABASE_URL) {
  process.env.TEST_DIRECT_GAMEPLAY_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/gameplay_test';
}
if (!process.env.TEST_DIRECT_LOCAL_ORCHESTRATOR_DATABASE_URL) {
  process.env.TEST_DIRECT_LOCAL_ORCHESTRATOR_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/local_orchestrator_test';
}
if (!process.env.TEST_DIRECT_WEBSOCKET_DATABASE_URL) {
  process.env.TEST_DIRECT_WEBSOCKET_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5432/websocket_test';
}
