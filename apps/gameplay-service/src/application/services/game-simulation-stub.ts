import type { WorldStateStub } from '@lib/lib-game-server';

/**
 * Stub game simulation for MVP: no real GameLoop, just tick counter and player set.
 * Publishes WorldState stub to NATS via callback.
 */
export class GameSimulationStub {
  private serverTick = 0;
  private readonly activePlayerIds: Set<string>;
  private tickInterval?: NodeJS.Timeout;

  constructor(
    public readonly matchId: string,
    public readonly playerIds: string[],
    private readonly publishWorldState: (state: WorldStateStub) => void,
    private readonly tickIntervalMs: number = 100,
  ) {
    this.activePlayerIds = new Set(playerIds);
  }

  removePlayer(playerId: string): void {
    this.activePlayerIds.delete(playerId);
  }

  getWorldState(): WorldStateStub {
    return {
      serverTick: this.serverTick,
      entities_full: [],
      events: [],
    };
  }

  startPublishLoop(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.serverTick += 1;
      this.publishWorldState(this.getWorldState());
    }, this.tickIntervalMs);
  }

  stopPublishLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
  }

  getActivePlayerIds(): string[] {
    return Array.from(this.activePlayerIds);
  }
}
