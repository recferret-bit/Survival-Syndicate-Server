import { Test } from '@nestjs/testing';
import { CreateLobbyHandler } from './create-lobby.handler';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { CreateLobbyCommand } from './create-lobby.command';

describe('CreateLobbyHandler', () => {
  it('creates a lobby', async () => {
    const lobbyRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'lobby-1',
        playerIds: ['10'],
        status: 'open',
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateLobbyHandler,
        { provide: LobbyPortRepository, useValue: lobbyRepository },
      ],
    }).compile();

    const handler = moduleRef.get(CreateLobbyHandler);
    const result = await handler.execute(
      new CreateLobbyCommand('10', { maxPlayers: 4 }),
    );

    expect(result.lobbyId).toBe('lobby-1');
    expect(result.playerIds).toEqual(['10']);
    expect(result.status).toBe('open');
  });
});
