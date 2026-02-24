import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GamesSubjects } from '@lib/lib-games';
import { firstValueFrom } from 'rxjs';
import { EnvService } from '@lib/shared';

interface CronEnv {
  GAMES_SESSION_INACTIVITY_TIMEOUT_MS?: string;
}

const GAMES_SESSION_INACTIVITY_TIMEOUT_MS_KEY =
  'GAMES_SESSION_INACTIVITY_TIMEOUT_MS';
const DEFAULT_INACTIVITY_TIMEOUT_MS = 600000; // 10 minutes

@Injectable()
export class ExpireInactiveSessionsService {
  private readonly logger = new Logger(ExpireInactiveSessionsService.name);

  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
    private readonly envService: EnvService<CronEnv>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async expireInactiveSessions(): Promise<void> {
    try {
      this.logger.log('Expiring inactive sessions...');

      // Get timeout from environment, default to 10 minutes
      const timeoutEnv = this.envService.get(
        GAMES_SESSION_INACTIVITY_TIMEOUT_MS_KEY,
      );
      const inactivityTimeoutMs = timeoutEnv
        ? Number.parseInt(timeoutEnv, 10)
        : DEFAULT_INACTIVITY_TIMEOUT_MS;

      if (Number.isNaN(inactivityTimeoutMs) || inactivityTimeoutMs <= 0) {
        this.logger.warn(
          `Invalid inactivity timeout from env: ${timeoutEnv}, using default: ${DEFAULT_INACTIVITY_TIMEOUT_MS}ms`,
        );
      }

      const result = await firstValueFrom(
        this.natsClient.send(GamesSubjects.EXPIRE_INACTIVE_SESSIONS, {
          inactivityTimeoutMs,
        }),
      );

      this.logger.log(`Expired ${result.expiredCount} inactive sessions`);
    } catch (error) {
      this.logger.error(
        `Error expiring inactive sessions: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
