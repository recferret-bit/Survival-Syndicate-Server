import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-gameplay';

export class UpsertZoneHeartbeatCommand {
  constructor(public readonly event: OrchestratorZoneHeartbeatEvent) {}
}
