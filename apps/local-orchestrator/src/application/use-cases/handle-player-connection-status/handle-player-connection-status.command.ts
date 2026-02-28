import { PlayerConnectionStatusEvent } from '@lib/lib-game-server';

export class HandlePlayerConnectionStatusCommand {
  constructor(public readonly event: PlayerConnectionStatusEvent) {}
}
