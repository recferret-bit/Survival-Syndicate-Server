import type { GameplayStartSimulationEvent } from '@lib/lib-game-server';

export class HandleStartSimulationCommand {
  constructor(public readonly event: GameplayStartSimulationEvent) {}
}
