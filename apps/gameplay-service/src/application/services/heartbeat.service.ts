import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { GameServerPublisher } from '@lib/lib-game-server';

@Injectable()
export class HeartbeatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HeartbeatService.name);
  private timer?: NodeJS.Timeout;
  private readonly serviceId: string;

  constructor(private readonly gameServerPublisher: GameServerPublisher) {
    this.serviceId = `gameplay-${process.pid}`;
  }

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.publishHeartbeat();
    }, 5_000);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async publishHeartbeat(): Promise<void> {
    try {
      await this.gameServerPublisher.publishGameplayServiceHeartbeat({
        serviceId: this.serviceId,
        reportedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code?: string }).code
          : undefined;
      if (code === '503') {
        this.logger.warn(
          'NATS JetStream unavailable (503). Is JetStream enabled and stream ready? Will retry.',
        );
      } else {
        this.logger.warn(
          'Heartbeat publish failed, will retry: %s',
          String(err),
        );
      }
    }
  }
}
