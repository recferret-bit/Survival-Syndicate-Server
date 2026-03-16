import { PlayerConnectionStatusEvent } from '@lib/lib-gameplay';

export class HandlePlayerConnectionStatusCommand {
  constructor(public readonly event: PlayerConnectionStatusEvent) {}
}
