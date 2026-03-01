import { Injectable } from '@nestjs/common';

export type LobbyState = {
  lobbyId: string;
  players: string[];
};

@Injectable()
export class LobbyStateSyncService {
  getStubState(matchId: string): LobbyState {
    return {
      lobbyId: matchId,
      players: [],
    };
  }
}
