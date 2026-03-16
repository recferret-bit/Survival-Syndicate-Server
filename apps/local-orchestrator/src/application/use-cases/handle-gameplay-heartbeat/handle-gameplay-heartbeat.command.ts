import { GameplayServiceHeartbeatEvent } from '@lib/lib-gameplay';

export class HandleGameplayHeartbeatCommand {
  constructor(public readonly event: GameplayServiceHeartbeatEvent) {}
}
