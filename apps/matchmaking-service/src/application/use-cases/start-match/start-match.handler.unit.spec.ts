import { Test } from '@nestjs/testing';
import { Lobby } from '@app/matchmaking-service/domain/entities/lobby/lobby';
import { GameServerPublisher } from '@lib/lib-game-server';
import { LobbyPortRepository } from '@app/matchmaking-service/application/ports/lobby.port.repository';
import { ZoneRegistryPort } from '@app/matchmaking-service/application/ports/zone-registry.port';
import { StartMatchHandler } from './start-match.handler';
import { StartMatchCommand } from './start-match.command';

describe('StartMatchHandler', () => {
  it('starts lobby and publishes found match', async () => {
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
    const zoneRegistry = {
      selectZone: jest.fn().mockResolvedValue({
        zoneId: 'zone-a',
        websocketUrl: 'ws://zone-a',
      }),
    };
    const gameServerPublisher = {
      publishMatchmakingFoundMatch: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StartMatchHandler,
        { provide: LobbyPortRepository, useValue: lobbyRepository },
        { provide: ZoneRegistryPort, useValue: zoneRegistry },
        { provide: GameServerPublisher, useValue: gameServerPublisher },
      ],
    }).compile();

    const handler = moduleRef.get(StartMatchHandler);
    const result = await handler.execute(new StartMatchCommand('lobby-1', '1'));

    expect(result.status).toBe('started');
    expect(gameServerPublisher.publishMatchmakingFoundMatch).toHaveBeenCalled();
  });
});
