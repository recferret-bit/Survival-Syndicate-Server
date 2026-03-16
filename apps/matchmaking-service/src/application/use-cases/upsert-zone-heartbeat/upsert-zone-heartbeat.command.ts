import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-local-orchestrator';

export class UpsertZoneHeartbeatCommand {
  constructor(public readonly event: OrchestratorZoneHeartbeatEvent) {}
}
