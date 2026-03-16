import { MatchmakingFoundMatchEvent } from '@lib/lib-matchmaking';

export class HandleFoundMatchCommand {
  constructor(public readonly event: MatchmakingFoundMatchEvent) {}
}
