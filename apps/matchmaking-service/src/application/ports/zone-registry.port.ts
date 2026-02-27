import { ZoneSelection } from '@app/matchmaking-service/domain/entities/lobby/lobby.type';
import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-game-server';

export abstract class ZoneRegistryPort {
  abstract upsertHeartbeat(
    event: OrchestratorZoneHeartbeatEvent,
  ): Promise<void>;
  abstract selectZone(): Promise<ZoneSelection | null>;
}
