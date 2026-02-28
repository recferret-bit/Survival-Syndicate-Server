import { GameplayServiceHeartbeatEvent } from '@lib/lib-game-server';

export class HandleGameplayHeartbeatCommand {
  constructor(public readonly event: GameplayServiceHeartbeatEvent) {}
}
