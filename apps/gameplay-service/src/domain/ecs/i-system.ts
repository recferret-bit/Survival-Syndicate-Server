import { WorldState } from './world-state';

export interface ISystem {
  update(worldState: WorldState, deltaMs: number): void;
}
