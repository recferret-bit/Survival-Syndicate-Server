import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EnvService } from '@lib/shared/application';
import { GameServerPublisher } from '@lib/lib-game-server';

@Injectable()
export class HeartbeatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HeartbeatService.name);
  private timer?: NodeJS.Timeout;
  private readonly gameplayHeartbeats = new Map<string, Date>();

  constructor(
    private readonly gameServerPublisher: GameServerPublisher,
    private readonly envService: EnvService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.publishZoneHeartbeat();
    }, 5_000);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async publishZoneHeartbeat(): Promise<void> {
    try {
      const port = Number(this.envService.get('LOCAL_ORCHESTRATOR_APP_PORT'));
      const websocketUrl = `ws://localhost:${port + 2000}`;
      await this.gameServerPublisher.publishOrchestratorZoneHeartbeat({
        zoneId: 'local-zone-1',
        websocketUrl,
        reportedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const code =
        err &&
        typeof err === 'object' &&
        'code' in err
          ? (err as { code?: string }).code
          : undefined;
      if (code === '503') {
        this.logger.warn(
          'NATS JetStream unavailable (503). Will retry on next interval.',
        );
      } else if (code === 'TIMEOUT') {
        this.logger.warn(
          'NATS request timeout when publishing zone heartbeat. Will retry.',
        );
      } else {
        this.logger.warn(
          'Zone heartbeat publish failed, will retry: %s',
          String(err),
        );
      }
    }
  }

  recordGameplayHeartbeat(serviceId: string): void {
    this.gameplayHeartbeats.set(serviceId, new Date());
    this.logger.log(`Gameplay heartbeat received from ${serviceId}`);
  }

  getLastGameplayHeartbeat(serviceId: string): Date | undefined {
    return this.gameplayHeartbeats.get(serviceId);
  }
}
