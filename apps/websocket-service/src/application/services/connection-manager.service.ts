import { Injectable } from '@nestjs/common';

export type ConnectionInfo = {
  playerId: string;
  matchId: string;
};

@Injectable()
export class ConnectionManagerService {
  /** clientId -> connection info (after authenticate) */
  private readonly connections = new Map<string, ConnectionInfo>();
  /** matchId -> set of clientIds */
  private readonly matchClients = new Map<string, Set<string>>();

  register(clientId: string, playerId: string, matchId: string): void {
    this.connections.set(clientId, { playerId, matchId });
    let set = this.matchClients.get(matchId);
    if (!set) {
      set = new Set();
      this.matchClients.set(matchId, set);
    }
    set.add(clientId);
  }

  unregister(clientId: string): ConnectionInfo | undefined {
    const info = this.connections.get(clientId);
    if (!info) return undefined;
    this.connections.delete(clientId);
    const set = this.matchClients.get(info.matchId);
    if (set) {
      set.delete(clientId);
      if (set.size === 0) this.matchClients.delete(info.matchId);
    }
    return info;
  }

  get(clientId: string): ConnectionInfo | undefined {
    return this.connections.get(clientId);
  }

  /** Return clientIds in the same match, excluding the given clientId */
  getOtherClientsInMatch(matchId: string, excludeClientId: string): string[] {
    const set = this.matchClients.get(matchId);
    if (!set) return [];
    return Array.from(set).filter((id) => id !== excludeClientId);
  }
}
