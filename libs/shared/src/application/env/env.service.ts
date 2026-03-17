import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolConfig } from 'pg';
import { Env } from './env';
import { NodeEnv } from '../enum';

@Injectable()
export class EnvService<E = {}> {
  constructor(private readonly configService: ConfigService<E & Env, true>) {}

  get<T extends keyof (E & Env)>(key: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ConfigService Path types are complex
    return this.configService.get(key as any, { infer: true });
  }

  isProd() {
    return (
      this.configService.get('NODE_ENV', { infer: true }) === NodeEnv.production
    );
  }

  isDev() {
    return (
      this.configService.get('NODE_ENV', { infer: true }) ===
      NodeEnv.development
    );
  }

  isLocal() {
    return (
      this.configService.get('NODE_ENV', { infer: true }) === NodeEnv.local
    );
  }

  getBoolean<T extends keyof (E & Env)>(key: T) {
    // @ts-expect-error - ConfigService.get overload resolution with generic key
    return this.configService.get(key, { infer: true }) === 'true';
  }

  /**
   * Get health port. appPort + 80.
   */
  getHealthPort(appPort: string): string {
    return String(Number(appPort) + 80);
  }

  /**
   * Get metrics port. appPort + 90.
   */
  getMetricsPort(appPort: string): string {
    return String(Number(appPort) + 90);
  }

  getUsersDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_USERS_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_USERS_DATABASE_URL', {
      infer: true,
    });
  }

  getPlayerDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_PLAYER_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_PLAYER_DATABASE_URL', {
      infer: true,
    });
  }

  getMatchmakingDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_MATCHMAKING_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_MATCHMAKING_DATABASE_URL', {
      infer: true,
    });
  }

  getGameplayDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_GAMEPLAY_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_GAMEPLAY_DATABASE_URL', {
      infer: true,
    });
  }

  getLocalOrchestratorDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get(
        'TEST_DIRECT_LOCAL_ORCHESTRATOR_DATABASE_URL',
        {
          infer: true,
        },
      );
    }
    return this.configService.get('PGBOUNCER_LOCAL_ORCHESTRATOR_DATABASE_URL', {
      infer: true,
    });
  }

  getWebsocketDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_WEBSOCKET_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_WEBSOCKET_DATABASE_URL', {
      infer: true,
    });
  }

  getBuildingDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_BUILDING_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_BUILDING_DATABASE_URL', {
      infer: true,
    });
  }

  getCombatProgressDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get(
        'TEST_DIRECT_COMBAT_PROGRESS_DATABASE_URL',
        { infer: true },
      );
    }
    return this.configService.get('PGBOUNCER_COMBAT_PROGRESS_DATABASE_URL', {
      infer: true,
    });
  }

  getSchedulerDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_SCHEDULER_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_SCHEDULER_DATABASE_URL', {
      infer: true,
    });
  }

  getCollectorDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_COLLECTOR_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_COLLECTOR_DATABASE_URL', {
      infer: true,
    });
  }

  getPaymentDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_PAYMENT_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_PAYMENT_DATABASE_URL', {
      infer: true,
    });
  }

  getHistoryDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_HISTORY_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_HISTORY_DATABASE_URL', {
      infer: true,
    });
  }

  getNatsServers(): string[] {
    const servers = this.configService.get('NATS_SERVERS', { infer: true });
    return servers
      ? servers.split(',').map((s) => s.trim())
      : ['nats://localhost:4222'];
  }

  getNatsUser() {
    return this.configService.get('NATS_USER', { infer: true });
  }

  getNatsPassword() {
    return this.configService.get('NATS_PASSWORD', { infer: true });
  }

  getNatsToken() {
    return this.configService.get('NATS_TOKEN', { infer: true });
  }

  getNatsStreamName() {
    return this.configService.get('NATS_STREAM_NAME', { infer: true });
  }

  /**
   * Get PostgreSQL pool configuration with SSL enabled for production.
   * Uses DATABASE_CA_CERT environment variable for DigitalOcean managed databases.
   *
   * @param connectionString - Database connection URL
   * @param additionalOptions - Additional pool options to merge (e.g., max, idleTimeoutMillis)
   * @returns PoolConfig with SSL configuration when in production
   */
  getPoolConfig(
    connectionString: string,
    additionalOptions?: Omit<PoolConfig, 'connectionString' | 'ssl'>,
  ): PoolConfig {
    const url = new URL(connectionString);
    const poolConfig: PoolConfig = {
      host: url.hostname,
      port: Number.parseInt(url.port),
      database: url.pathname.slice(1),
      user: url.username,
      password: decodeURIComponent(url.password),
      ...additionalOptions,
    };

    // Add SSL configuration for production when DATABASE_CA_CERT is set
    if (this.isProd()) {
      let caCert = this.configService.get('DATABASE_CA_CERT', {
        infer: true,
      });

      // Normalize PEM: trim and convert escaped newlines to real newlines (env/K8s compatibility)
      if (caCert) {
        // Handle both literal \n strings and already-escaped newlines
        caCert = caCert
          .trim()
          .replaceAll(/(^"|"$)/g, '')
          .replaceAll(String.raw`\n`, '\n');

        poolConfig.ssl = {
          rejectUnauthorized: true,
          ca: caCert,
        };
      } else {
        Logger.warn(
          'Production mode but DATABASE_CA_CERT is not set - SSL connections may fail',
        );
      }
    }

    return poolConfig;
  }
}
