import type { GameplayStartSimulationEvent } from '@lib/lib-local-orchestrator';

export class HandleStartSimulationCommand {
  constructor(public readonly event: GameplayStartSimulationEvent) {}
}
