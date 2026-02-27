import { Injectable } from '@nestjs/common';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { ZoneSelection } from '@app/matchmaking-service/domain/entities/lobby/lobby.type';
import { OrchestratorZoneHeartbeatEvent } from '@lib/lib-game-server';

@Injectable()
export class ZoneRegistryInMemoryRepository extends ZoneRegistryPort {
  private readonly zones = new Map<string, ZoneSelection>();

  async upsertHeartbeat(event: OrchestratorZoneHeartbeatEvent): Promise<void> {
    this.zones.set(event.zoneId, {
      zoneId: event.zoneId,
      websocketUrl: event.websocketUrl,
    });
  }

  async selectZone(): Promise<ZoneSelection | null> {
    const iterator = this.zones.values().next();
    return iterator.done ? null : iterator.value;
  }
}
