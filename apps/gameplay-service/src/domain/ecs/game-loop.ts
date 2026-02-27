import { ISystem } from './i-system';
import { WorldState } from './world-state';

export class GameLoop {
  constructor(private readonly systems: ISystem[] = []) {}

  tick(worldState: WorldState, deltaMs: number): WorldState {
    for (const system of this.systems) {
      system.update(worldState, deltaMs);
    }

    return {
      ...worldState,
      tick: worldState.tick + 1,
      serverTime: worldState.serverTime + deltaMs,
    };
  }
}
