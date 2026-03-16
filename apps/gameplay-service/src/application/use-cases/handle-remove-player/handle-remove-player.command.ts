import type { GameplayRemovePlayerEvent } from '@lib/lib-local-orchestrator';

export class HandleRemovePlayerCommand {
  constructor(public readonly event: GameplayRemovePlayerEvent) {}
}
