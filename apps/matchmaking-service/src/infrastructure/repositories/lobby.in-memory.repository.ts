import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { CreateLobby } from '@app/matchmaking-service/domain/entities/lobby/lobby.type';
import { Lobby } from '@app/matchmaking-service/domain/entities/lobby/lobby';

@Injectable()
export class LobbyInMemoryRepository extends LobbyPortRepository {
  private readonly lobbies = new Map<string, Lobby>();

  async create(data: CreateLobby): Promise<Lobby> {
    const now = new Date();
    const lobby = new Lobby({
      id: randomUUID(),
      ownerPlayerId: data.ownerPlayerId,
      playerIds: [data.ownerPlayerId],
      maxPlayers: data.maxPlayers,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });
    this.lobbies.set(lobby.id, lobby);
    return lobby;
  }

  async findById(lobbyId: string): Promise<Lobby | null> {
    return this.lobbies.get(lobbyId) ?? null;
  }

  async save(lobby: Lobby): Promise<void> {
    this.lobbies.set(lobby.id, lobby);
  }
}
