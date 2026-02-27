import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-game-server';

export class UpsertZoneHeartbeatCommand {
  constructor(public readonly event: OrchestratorZoneHeartbeatEvent) {}
}
