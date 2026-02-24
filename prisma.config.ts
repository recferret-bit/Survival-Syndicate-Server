import { defineConfig } from 'prisma/config';

type Database =
  | 'users'
  | 'payments'
  | 'test-payment-provider'
  | 'games'
  | 'test-game-provider'
  | 'bonus'
  | 'balance'
  | 'currency-rate';

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

export function getPrismaConfig(database: Database) {
  const isLocal = process.env.NODE_ENV === 'local';

  const usersDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_USERS_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_USERS_DATABASE_URL);
  const balanceDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_BALANCE_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_BALANCE_DATABASE_URL);
  const paymentsDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_PAYMENTS_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_PAYMENTS_DATABASE_URL);
  const testPaymentProviderDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_TEST_PAYMENT_PROVIDER_DATABASE_URL
    : ensurePgBouncerParam(
        process.env.PGBOUNCER_TEST_PAYMENT_PROVIDER_DATABASE_URL,
      );
  const gamesDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_GAMES_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_GAMES_DATABASE_URL);
  const testGameProviderDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_TEST_GAME_PROVIDER_DATABASE_URL
    : ensurePgBouncerParam(
        process.env.PGBOUNCER_TEST_GAME_PROVIDER_DATABASE_URL,
      );
  const bonusDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_BONUS_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_BONUS_DATABASE_URL);
  const currencyRateDatabaseUrl = isLocal
    ? process.env.TEST_DIRECT_CURRENCY_RATE_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_CURRENCY_RATE_DATABASE_URL);

  console.log('isLocal: ', isLocal);
  console.log('usersDatabaseUrl: ', usersDatabaseUrl);
  console.log('balanceDatabaseUrl: ', balanceDatabaseUrl);
  console.log('paymentsDatabaseUrl: ', paymentsDatabaseUrl);
  console.log(
    'testPaymentProviderDatabaseUrl: ',
    testPaymentProviderDatabaseUrl,
  );
  console.log('gamesDatabaseUrl: ', gamesDatabaseUrl);
  console.log('testGameProviderDatabaseUrl: ', testGameProviderDatabaseUrl);
  console.log('bonusDatabaseUrl: ', bonusDatabaseUrl);
  console.log('database: ', database);

  if (database === 'users' && !usersDatabaseUrl) {
    throw new Error('Environment variable USERS_DATABASE_URL is not set.');
  }
  if (database === 'balance' && !balanceDatabaseUrl) {
    throw new Error('Environment variable BALANCE_DATABASE_URL is not set.');
  }
  if (database === 'payments' && !paymentsDatabaseUrl) {
    throw new Error('Environment variable PAYMENTS_DATABASE_URL is not set.');
  }
  if (database === 'test-payment-provider' && !testPaymentProviderDatabaseUrl) {
    throw new Error(
      'Environment variable TEST_PAYMENT_PROVIDER_DATABASE_URL is not set.',
    );
  }
  if (database === 'games' && !gamesDatabaseUrl) {
    throw new Error('Environment variable GAMES_DATABASE_URL is not set.');
  }
  if (database === 'test-game-provider' && !testGameProviderDatabaseUrl) {
    throw new Error(
      'Environment variable TEST_GAME_PROVIDER_DATABASE_URL is not set.',
    );
  }
  if (database === 'bonus' && !bonusDatabaseUrl) {
    throw new Error('Environment variable BONUS_DATABASE_URL is not set.');
  }
  if (database === 'currency-rate' && !currencyRateDatabaseUrl) {
    throw new Error(
      'Environment variable CURRENCY_RATE_DATABASE_URL is not set.',
    );
  }

  const configs = {
    users: defineConfig({
      schema: './prisma/users/schema.prisma',
      migrations: {
        path: './prisma/users/migrations',
      },
      datasource: {
        url: usersDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5432/users_shadow',
      },
    }),
    balance: defineConfig({
      schema: './prisma/balance/schema.prisma',
      migrations: {
        path: './prisma/balance/migrations',
      },
      datasource: {
        url: balanceDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5432/balance_shadow',
      },
    }),
    payments: defineConfig({
      schema: './prisma/payments/schema.prisma',
      migrations: {
        path: './prisma/payments/migrations',
      },
      datasource: {
        url: paymentsDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5433/payments_shadow',
      },
    }),
    'test-payment-provider': defineConfig({
      schema: './prisma/test-payment-provider/schema.prisma',
      migrations: {
        path: './prisma/test-payment-provider/migrations',
      },
      datasource: {
        url: testPaymentProviderDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5433/test_payment_provider_shadow',
      },
    }),
    games: defineConfig({
      schema: './prisma/games/schema.prisma',
      migrations: {
        path: './prisma/games/migrations',
      },
      datasource: {
        url: gamesDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5434/games_shadow',
      },
    }),
    'test-game-provider': defineConfig({
      schema: './prisma/test-game-provider/schema.prisma',
      migrations: {
        path: './prisma/test-game-provider/migrations',
      },
      datasource: {
        url: testGameProviderDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5434/test_game_provider_shadow',
      },
    }),
    bonus: defineConfig({
      schema: './prisma/bonus/schema.prisma',
      migrations: {
        path: './prisma/bonus/migrations',
      },
      datasource: {
        url: bonusDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5434/bonus_shadow',
      },
    }),
    'currency-rate': defineConfig({
      schema: './prisma/currency-rate/schema.prisma',
      migrations: {
        path: './prisma/currency-rate/migrations',
      },
      datasource: {
        url: currencyRateDatabaseUrl as string,
        shadowDatabaseUrl:
          'postgresql://postgres:postgres@localhost:5432/currency_rate_shadow',
      },
    }),
  };

  return configs[database];
}

// Export a default for CLI usage via environment variable
// Only throw error if PRISMA_DB is explicitly required (when using --config flag)
// When using --schema flag, Prisma should not load this config, but if it does,
// we'll return a dummy config to prevent errors
const database = process.env.PRISMA_DB as Database;
export default getPrismaConfig(database);

// Usage:
// $env:PRISMA_DB="users"; npx prisma migrate dev --config ./prisma.config.ts
// $env:PRISMA_DB="payments"; npx prisma migrate dev --config ./prisma.config.ts
// $env:PRISMA_DB="balance"; npx prisma migrate dev --config ./prisma.config.ts
// $env:PRISMA_DB="games"; npx prisma migrate dev --config ./prisma.config.ts
// $env:PRISMA_DB="users"; npx prisma generate --config ./prisma.config.ts
// $env:PRISMA_DB="payments"; npx prisma generate --config ./prisma.config.ts
// $env:PRISMA_DB="balance"; npx prisma generate --config ./prisma.config.ts
// $env:PRISMA_DB="games"; npx prisma generate --config ./prisma.config.ts
