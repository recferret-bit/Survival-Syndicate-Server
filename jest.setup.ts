process.env.NODE_ENV = 'local';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (!process.env.NATS_SERVERS) {
  process.env.NATS_SERVERS = 'nats://localhost:4222';
}

// Set additional required env vars that might be missing
if (!process.env.PROJECT) {
  process.env.PROJECT = 'slotz';
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

if (!process.env.PGBOUNCER_USERS_DATABASE_URL) {
  process.env.PGBOUNCER_USERS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/users_db';
}
if (!process.env.PGBOUNCER_BALANCE_DATABASE_URL) {
  process.env.PGBOUNCER_BALANCE_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/balance_db';
}
if (!process.env.PGBOUNCER_PAYMENTS_DATABASE_URL) {
  process.env.PGBOUNCER_PAYMENTS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/payments_db';
}
if (!process.env.PGBOUNCER_TEST_PAYMENT_PROVIDER_DATABASE_URL) {
  process.env.PGBOUNCER_TEST_PAYMENT_PROVIDER_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/test_payment_provider_db';
}
if (!process.env.PGBOUNCER_GAMES_DATABASE_URL) {
  process.env.PGBOUNCER_GAMES_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/games_db';
}
if (!process.env.PGBOUNCER_TEST_GAME_PROVIDER_DATABASE_URL) {
  process.env.PGBOUNCER_TEST_GAME_PROVIDER_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/test_game_provider_db';
}
if (!process.env.PGBOUNCER_BONUS_DATABASE_URL) {
  process.env.PGBOUNCER_BONUS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:6432/bonus_db';
}
if (!process.env.TEST_DIRECT_USERS_DATABASE_URL) {
  process.env.TEST_DIRECT_USERS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/users_test';
}
if (!process.env.TEST_DIRECT_BALANCE_DATABASE_URL) {
  process.env.TEST_DIRECT_BALANCE_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/balance_test';
}
if (!process.env.TEST_DIRECT_PAYMENTS_DATABASE_URL) {
  process.env.TEST_DIRECT_PAYMENTS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/payments_test';
}
if (!process.env.TEST_DIRECT_TEST_PAYMENT_PROVIDER_DATABASE_URL) {
  process.env.TEST_DIRECT_TEST_PAYMENT_PROVIDER_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/test_payment_provider_test';
}
if (!process.env.TEST_DIRECT_GAMES_DATABASE_URL) {
  process.env.TEST_DIRECT_GAMES_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/games_test';
}
if (!process.env.TEST_DIRECT_TEST_GAME_PROVIDER_DATABASE_URL) {
  process.env.TEST_DIRECT_TEST_GAME_PROVIDER_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/test_game_provider_test';
}
if (!process.env.TEST_DIRECT_BONUS_DATABASE_URL) {
  process.env.TEST_DIRECT_BONUS_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/bonus_test';
}

