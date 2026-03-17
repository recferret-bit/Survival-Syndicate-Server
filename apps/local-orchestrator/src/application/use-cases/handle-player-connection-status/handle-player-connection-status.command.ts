import { PlayerConnectionStatusEvent } from '@lib/lib-websocket';

export class HandlePlayerConnectionStatusCommand {
  constructor(public readonly event: PlayerConnectionStatusEvent) {}
}
