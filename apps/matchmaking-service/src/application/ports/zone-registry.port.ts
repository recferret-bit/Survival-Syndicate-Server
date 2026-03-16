import { ZoneSelection } from '@app/matchmaking-service/domain/entities/lobby/lobby.type';
import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-local-orchestrator';

export abstract class ZoneRegistryPort {
  abstract upsertHeartbeat(
    event: OrchestratorZoneHeartbeatEvent,
  ): Promise<void>;
  abstract selectZone(): Promise<ZoneSelection | null>;
}
