import { LobbyStateSyncService } from './lobby-state-sync.service';

describe('LobbyStateSyncService', () => {
  it('getStubState returns lobby with matchId and empty players', () => {
    const service = new LobbyStateSyncService();
    const state = service.getStubState('match-1');
    expect(state).toEqual({
      lobbyId: 'match-1',
      players: [],
    });
  });
});
