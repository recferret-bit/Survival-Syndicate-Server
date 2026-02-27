import { Lobby } from './lobby';

describe('Lobby', () => {
  it('joins and leaves lobby', () => {
    const lobby = new Lobby({
      id: 'lobby-1',
      ownerPlayerId: '1',
      playerIds: ['1'],
      maxPlayers: 4,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    lobby.join('2');
    expect(lobby.playerIds).toEqual(['1', '2']);

    lobby.leave('2');
    expect(lobby.playerIds).toEqual(['1']);
  });

  it('starts lobby with match and zone', () => {
    const lobby = new Lobby({
      id: 'lobby-1',
      ownerPlayerId: '1',
      playerIds: ['1', '2'],
      maxPlayers: 4,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    lobby.start('match-1', { zoneId: 'zone-a', websocketUrl: 'ws://zone-a' });

    expect(lobby.status).toBe('started');
    expect(lobby.matchId).toBe('match-1');
    expect(lobby.zoneId).toBe('zone-a');
  });
});
