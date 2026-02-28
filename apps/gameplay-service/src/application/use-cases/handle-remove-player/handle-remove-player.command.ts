import type { GameplayRemovePlayerEvent } from '@lib/lib-game-server';

export class HandleRemovePlayerCommand {
  constructor(public readonly event: GameplayRemovePlayerEvent) {}
}
