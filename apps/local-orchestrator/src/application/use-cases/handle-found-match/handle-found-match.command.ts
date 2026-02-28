import { MatchmakingFoundMatchEvent } from '@lib/lib-game-server';

export class HandleFoundMatchCommand {
  constructor(public readonly event: MatchmakingFoundMatchEvent) {}
}
