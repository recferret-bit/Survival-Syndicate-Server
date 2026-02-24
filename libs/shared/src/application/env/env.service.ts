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

  getAdminPort() {
    return this.configService.get('ADMIN_PORT', { infer: true });
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

  /**
   * Get health port. For local: appPort + 80. For dev/prod: HEALTH_PORT from env.
   */
  getHealthPort(appPort?: string): string {
    if (this.isLocal() && appPort !== undefined && appPort !== '') {
      return String(Number(appPort) + 80);
    }
    const port = this.configService.get<string>('HEALTH_PORT');
    return String(port ?? '5080');
  }

  /**
   * Get metrics port. For local: appPort + 90. For dev/prod: METRICS_PORT from env.
   */
  getMetricsPort(appPort?: string): string {
    if (this.isLocal() && appPort !== undefined && appPort !== '') {
      return String(Number(appPort) + 90);
    }
    const port = this.configService.get<string>('METRICS_PORT');
    return String(port ?? '3080');
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

  getPaymentsDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_PAYMENTS_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_PAYMENTS_DATABASE_URL', {
      infer: true,
    });
  }

  getTestPaymentProviderDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get(
        'TEST_DIRECT_TEST_PAYMENT_PROVIDER_DATABASE_URL',
        {
          infer: true,
        },
      );
    }
    return this.configService.get(
      'PGBOUNCER_TEST_PAYMENT_PROVIDER_DATABASE_URL',
      {
        infer: true,
      },
    );
  }

  getBalanceDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_BALANCE_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_BALANCE_DATABASE_URL', {
      infer: true,
    });
  }

  getGamesDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_GAMES_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_GAMES_DATABASE_URL', {
      infer: true,
    });
  }

  getTestGameProviderDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get(
        'TEST_DIRECT_TEST_GAME_PROVIDER_DATABASE_URL',
        {
          infer: true,
        },
      );
    }
    return this.configService.get('PGBOUNCER_TEST_GAME_PROVIDER_DATABASE_URL', {
      infer: true,
    });
  }

  getBonusDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_BONUS_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_BONUS_DATABASE_URL', {
      infer: true,
    });
  }

  getCurrencyRateDatabaseUrl() {
    if (this.isLocal()) {
      return this.configService.get('TEST_DIRECT_CURRENCY_RATE_DATABASE_URL', {
        infer: true,
      });
    }
    return this.configService.get('PGBOUNCER_CURRENCY_RATE_DATABASE_URL', {
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

  getBoolean<T extends keyof (E & Env)>(key: T) {
    // @ts-expect-error - ConfigService.get overload resolution with generic key
    return this.configService.get(key, { infer: true }) === 'true';
  }

  getAppHttpUrlByName(
    name:
      | 'Users'
      | 'Balance'
      | 'Payments'
      | 'Test-Payment-Provider'
      | 'Games'
      | 'Test-Game-Provider'
      | 'Bonus',
  ) {
    Logger.log(`Getting app HTTP URL by name: ${name}`);
    switch (name) {
      case 'Users':
        return this.configService.get('USERS_APP_HOST', { infer: true });
      case 'Balance':
        return this.configService.get('BALANCE_APP_HOST', { infer: true });
      case 'Payments':
        return this.configService.get('PAYMENTS_APP_HOST', { infer: true });
      case 'Test-Payment-Provider':
        return this.configService.get('TEST_PAYMENT_PROVIDER_APP_HOST', {
          infer: true,
        });
      case 'Games':
        return this.configService.get('GAMES_APP_HOST', { infer: true });
      case 'Test-Game-Provider':
        return this.configService.get('TEST_GAME_PROVIDER_APP_HOST', {
          infer: true,
        });
      case 'Bonus':
        return this.configService.get('BONUS_APP_HOST', { infer: true });
      default:
        return 'localhost';
    }
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
