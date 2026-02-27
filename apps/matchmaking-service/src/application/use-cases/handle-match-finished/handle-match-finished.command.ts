import { MatchFinishedEvent } from '@lib/lib-game-server';

export class HandleMatchFinishedCommand {
  constructor(public readonly event: MatchFinishedEvent) {}
}
