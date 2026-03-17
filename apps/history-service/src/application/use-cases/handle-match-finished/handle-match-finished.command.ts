import type { MatchFinishedEvent } from '@lib/lib-gameplay';

export class HandleMatchFinishedCommand {
  constructor(public readonly event: MatchFinishedEvent) {}
}
