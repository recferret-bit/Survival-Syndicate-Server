import { Test } from '@nestjs/testing';
import { Lobby } from '@app/matchmaking-service/domain/entities/lobby/lobby';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { JoinLobbyHandler } from './join-lobby.handler';
import { JoinLobbyCommand } from './join-lobby.command';

describe('JoinLobbyHandler', () => {
  it('adds player to lobby', async () => {
    const lobby = new Lobby({
      id: 'lobby-1',
      ownerPlayerId: '1',
      playerIds: ['1'],
      maxPlayers: 4,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const lobbyRepository = {
      findById: jest.fn().mockResolvedValue(lobby),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        JoinLobbyHandler,
        { provide: LobbyPortRepository, useValue: lobbyRepository },
      ],
    }).compile();

    const handler = moduleRef.get(JoinLobbyHandler);
    const result = await handler.execute(new JoinLobbyCommand('lobby-1', '2'));

    expect(result.playerIds).toEqual(['1', '2']);
  });
});
