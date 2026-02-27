import { Test } from '@nestjs/testing';
import { stringToBigNumber } from '@lib/shared';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { GetPlayerHandler } from './get-player.handler';
import { GetPlayerQuery } from './get-player.query';

describe('GetPlayerHandler', () => {
  it('returns player by id', async () => {
    const playerRepository = {
      findById: jest.fn().mockResolvedValue({
        id: stringToBigNumber('7'),
        userId: stringToBigNumber('42'),
        username: 'player_42',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetPlayerHandler,
        { provide: PlayerPortRepository, useValue: playerRepository },
      ],
    }).compile();

    const handler = moduleRef.get(GetPlayerHandler);
    const result = await handler.execute(new GetPlayerQuery('7'));

    expect(result.playerId).toBe('7');
    expect(result.userId).toBe('42');
    expect(result.username).toBe('player_42');
  });
});
