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

  JWT_SECRET: z.string().default('change_me_asap'),
  PASSWORD_SECRET: z.string().default('change_me_asap'),

  NATS_SERVERS: z.string(),
  NATS_USER: z.string().optional(),
  NATS_PASSWORD: z.string().optional(),
  NATS_TOKEN: z.string().optional(),
  NATS_STREAM_NAME: z.string().optional(),

  REDIS_URL: z.string(),

  // swagger-aggregator
  SWAGGER_APP_HOST: z.string().default('localhost'),
  SWAGGER_APP_PORT: z.string().default('3000'),
  SWAGGER_APP_HTTP_PREFIX: z.string().default('api/v1'),

  // users-service
  USERS_APP_HOST: z.string().default('localhost'),
  USERS_APP_PORT: z.string().default('3001'),
  USERS_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_USERS_DATABASE_URL: z.string(),
  TEST_DIRECT_USERS_DATABASE_URL: z.string().optional(),

  // player-service
  PLAYER_APP_HOST: z.string().default('localhost'),
  PLAYER_APP_PORT: z.string().default('3002'),
  PLAYER_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_PLAYER_DATABASE_URL: z.string(),
  TEST_DIRECT_PLAYER_DATABASE_URL: z.string().optional(),

  // matchmaking-service
  MATCHMAKING_APP_HOST: z.string().default('localhost'),
  MATCHMAKING_APP_PORT: z.string().default('3003'),
  MATCHMAKING_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_MATCHMAKING_DATABASE_URL: z.string(),
  TEST_DIRECT_MATCHMAKING_DATABASE_URL: z.string().optional(),

  // gameplay-service
  GAMEPLAY_APP_HOST: z.string().default('localhost'),
  GAMEPLAY_APP_PORT: z.string().default('3004'),
  GAMEPLAY_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_GAMEPLAY_DATABASE_URL: z.string(),
  TEST_DIRECT_GAMEPLAY_DATABASE_URL: z.string().optional(),

  // local-orchestrator
  LOCAL_ORCHESTRATOR_APP_HOST: z.string().default('localhost'),
  LOCAL_ORCHESTRATOR_APP_PORT: z.string().default('3005'),
  LOCAL_ORCHESTRATOR_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_LOCAL_ORCHESTRATOR_DATABASE_URL: z.string(),
  TEST_DIRECT_LOCAL_ORCHESTRATOR_DATABASE_URL: z.string().optional(),

  // websocket-service
  WEBSOCKET_APP_HOST: z.string().default('localhost'),
  WEBSOCKET_APP_PORT: z.string().default('3006'),
  WEBSOCKET_APP_HTTP_PREFIX: z.string().default('api/v1'),
  PGBOUNCER_WEBSOCKET_DATABASE_URL: z.string(),
  TEST_DIRECT_WEBSOCKET_DATABASE_URL: z.string().optional(),

  DATABASE_CA_CERT: z.string().optional(),
});

export type Env = z.infer<typeof commonSchema>;
