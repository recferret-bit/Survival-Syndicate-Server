import { z } from 'zod';
import { NodeEnv } from '../enum';

export const commonSchema = z.object({
  NODE_ENV: z
    .enum([
      NodeEnv.production,
      NodeEnv.stage,
      NodeEnv.development,
      NodeEnv.local,
    ])
    .default(NodeEnv.development),

  ADMIN_PORT: z.string().default('3002'),

  // Generic ports for K8s deployment (each pod has its own namespace)
  HEALTH_PORT: z.string().default('5000'),
  METRICS_PORT: z.string().default('9090'),

  JWT_SECRET: z.string().default('change_me_asap'),
  PASSWORD_SECRET: z.string().default('change_me_asap'),

  GA_API_KEY: z.string().optional(),
  GA_MEASUREMENT_ID: z.string().optional(),

  YA_SECRET_TOKEN: z.string().optional(),
  YA_COUNTER_ID: z.string().optional(),

  NATS_SERVERS: z.string(),
  NATS_USER: z.string().optional(),
  NATS_PASSWORD: z.string().optional(),
  NATS_TOKEN: z.string().optional(),
  NATS_STREAM_NAME: z.string().optional(),

  REDIS_URL: z.string(),

  PGBOUNCER_USERS_DATABASE_URL: z.string(),
  PGBOUNCER_BALANCE_DATABASE_URL: z.string(),
  PGBOUNCER_PAYMENTS_DATABASE_URL: z.string(),
  PGBOUNCER_TEST_PAYMENT_PROVIDER_DATABASE_URL: z.string().optional(),
  PGBOUNCER_TEST_GAME_PROVIDER_DATABASE_URL: z.string().optional(),
  PGBOUNCER_GAMES_DATABASE_URL: z.string(),
  PGBOUNCER_BONUS_DATABASE_URL: z.string(),
  PGBOUNCER_CURRENCY_RATE_DATABASE_URL: z.string().optional(),

  TEST_DIRECT_USERS_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_BALANCE_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_PAYMENTS_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_TEST_PAYMENT_PROVIDER_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_TEST_GAME_PROVIDER_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_GAMES_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_BONUS_DATABASE_URL: z.string().optional(),
  TEST_DIRECT_CURRENCY_RATE_DATABASE_URL: z.string().optional(),

  USERS_APP_HTTP_PREFIX: z.string().default('api/v2'),
  BALANCE_APP_HTTP_PREFIX: z.string().default('api/v2'),
  PAYMENTS_APP_HTTP_PREFIX: z.string().default('api/v2'),
  TEST_PAYMENT_PROVIDER_HTTP_PREFIX: z.string().default('api/v2'),
  GAMES_APP_HTTP_PREFIX: z.string().default('api/v2'),
  TEST_GAME_PROVIDER_HTTP_PREFIX: z.string().default('api/v2'),
  BONUS_APP_HTTP_PREFIX: z.string().default('api/v2'),
  MATCHMAKING_APP_HTTP_PREFIX: z.string().default('api/v2'),
  LOCAL_ORCHESTRATOR_APP_HTTP_PREFIX: z.string().default('api/v2'),
  GAMEPLAY_APP_HTTP_PREFIX: z.string().default('api/v2'),
  WEBSOCKET_APP_HTTP_PREFIX: z.string().default('api/v2'),

  USERS_APP_HOST: z.string().default('localhost'),
  USERS_APP_PORT: z.string().default('3000'),
  USERS_HEALTH_PORT: z.string().default('5000'),

  BALANCE_APP_HOST: z.string().default('localhost'),
  BALANCE_APP_PORT: z.string().default('3001'),
  BALANCE_HEALTH_PORT: z.string().default('5001'),

  PAYMENTS_APP_HOST: z.string().default('localhost'),
  PAYMENTS_APP_PORT: z.string().default('3002'),
  PAYMENTS_HEALTH_PORT: z.string().default('5002'),

  TEST_PAYMENT_PROVIDER_APP_HOST: z.string().default('localhost'),
  TEST_PAYMENT_PROVIDER_APP_PORT: z.string().default('3003'),
  TEST_PAYMENT_PROVIDER_HEALTH_PORT: z.string().default('5003'),

  GAMES_APP_HOST: z.string().default('localhost'),
  GAMES_APP_PORT: z.string().default('3004'),
  GAMES_HEALTH_PORT: z.string().default('5004'),

  // InOut Games
  INOUT_SECRET: z.string().optional(),
  INOUT_OPERATOR_ID: z.string().optional(),
  INOUT_BASE_URL: z.string().optional(),

  // Slotegrator
  SLOTEGRATOR_BASE_URL: z.string().optional(),
  SLOTEGRATOR_MERCHANT_ID: z.string().optional(),
  SLOTEGRATOR_MERCHANT_KEY: z.string().optional(),

  // JILI Games
  JILI_BASE_URL: z.string().optional(),
  JILI_AGENT_ID: z.string().optional(),
  JILI_AGENT_KEY: z.string().optional(),
  JILI_CALLBACK_USERNAME: z.string().optional(),
  JILI_CALLBACK_PASSWORD: z.string().optional(),
  JILI_OFFLINE_TOKEN_KEY: z.string().optional(),

  TEST_GAME_PROVIDER_APP_HOST: z.string().default('localhost'),
  TEST_GAME_PROVIDER_APP_PORT: z.string().default('3005'),
  TEST_GAME_PROVIDER_HEALTH_PORT: z.string().default('5005'),
  TEST_GAME_PROVIDER_API_KEY: z.string().optional(),

  BONUS_APP_HOST: z.string().default('localhost'),
  BONUS_APP_PORT: z.string().default('3006'),
  BONUS_HEALTH_PORT: z.string().default('5006'),
  MATCHMAKING_APP_PORT: z.string().default('3010'),
  LOCAL_ORCHESTRATOR_APP_PORT: z.string().default('3011'),
  GAMEPLAY_APP_PORT: z.string().default('3012'),
  WEBSOCKET_APP_PORT: z.string().default('3013'),

  SWAGGER_AGGREGATOR_APP_HOST: z.string().default('localhost'),
  SWAGGER_AGGREGATOR_APP_PORT: z.string().default('3100'),
  SWAGGER_AGGREGATOR_HEALTH_PORT: z.string().default('5100'),
  SWAGGER_AGGREGATOR_HTTP_PREFIX: z.string().default('api/v2'),

  CRON_APP_PORT: z.string().default('5200'),
  CRON_HEALTH_PORT: z.string().default('5200'),

  CURRENCY_RATE_APP_PORT: z.string().default('3007'),
  CURRENCY_RATE_CRON_EXPRESSION: z.string().default('* * * * *'),
  CURRENCY_RATE_CACHE_TTL_SECONDS: z.string().default('3600'),
  OPENEXCHANGERATES_APP_ID: z.string().optional(),

  // Test payment provider
  TEST_PAYMENT_PROVIDER_BASE_URL: z.string().optional(),
  TEST_PAYMENT_PROVIDER_API_KEY: z.string().optional(),

  // Polling transactions
  POLLING_BATCH_SIZE: z.string().default('50'),

  // Kvadrix
  KVADRIX_API_KEY: z.string().optional(),
  KVADRIX_BASE_URL: z.string().optional(),
  KVADRIX_RETURN_URL_BASE: z.string().optional(),

  // Database SSL/TLS CA Certificate (for DigitalOcean managed databases)
  // Set this in production with the certificate content
  DATABASE_CA_CERT: z.string().optional(),
});

export type Env = z.infer<typeof commonSchema>;
