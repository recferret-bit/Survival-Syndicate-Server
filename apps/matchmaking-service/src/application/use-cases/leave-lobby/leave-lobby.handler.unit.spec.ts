import { Test } from '@nestjs/testing';
import { Lobby } from '@app/matchmaking-service/domain/entities/lobby/lobby';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { LeaveLobbyHandler } from './leave-lobby.handler';
import { LeaveLobbyCommand } from './leave-lobby.command';

describe('LeaveLobbyHandler', () => {
  it('removes player from lobby', async () => {
    const lobby = new Lobby({
      id: 'lobby-1',
      ownerPlayerId: '1',
      playerIds: ['1', '2'],
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
        LeaveLobbyHandler,
        { provide: LobbyPortRepository, useValue: lobbyRepository },
      ],
    }).compile();

    const handler = moduleRef.get(LeaveLobbyHandler);
    const result = await handler.execute(new LeaveLobbyCommand('lobby-1', '2'));

    expect(result.playerIds).toEqual(['1']);
  });
});
