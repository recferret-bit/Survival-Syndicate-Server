import { Lobby } from '@app/matchmaking-service/domain/entities/lobby/lobby';
import { CreateLobby } from '@app/matchmaking-service/domain/entities/lobby/lobby.type';

export abstract class LobbyPortRepository {
  abstract create(data: CreateLobby): Promise<Lobby>;
  abstract findById(lobbyId: string): Promise<Lobby | null>;
  abstract save(lobby: Lobby): Promise<void>;
}
