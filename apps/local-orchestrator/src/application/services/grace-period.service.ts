import { Injectable, OnModuleDestroy } from '@nestjs/common';

export type GracePeriodCallback = () => Promise<void> | void;

@Injectable()
export class GracePeriodService implements OnModuleDestroy {
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly timeoutMs: number;

  constructor() {
    this.timeoutMs = 60_000;
  }

  start(
    matchId: string,
    playerId: string,
    callback: GracePeriodCallback,
  ): void {
    const key = this.buildKey(matchId, playerId);
    this.cancel(matchId, playerId);
    const timer = setTimeout(() => {
      void callback();
      this.timers.delete(key);
    }, this.timeoutMs);
    this.timers.set(key, timer);
  }

  cancel(matchId: string, playerId: string): void {
    const key = this.buildKey(matchId, playerId);
    const timer = this.timers.get(key);
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    this.timers.delete(key);
  }

  has(matchId: string, playerId: string): boolean {
    return this.timers.has(this.buildKey(matchId, playerId));
  }

  onModuleDestroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  private buildKey(matchId: string, playerId: string): string {
    return `${matchId}:${playerId}`;
  }
}
