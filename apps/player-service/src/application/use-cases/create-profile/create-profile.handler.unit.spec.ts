import { Test } from '@nestjs/testing';
import { stringToBigNumber } from '@lib/shared';
import { PlayerPortRepository } from '@app/player-service/application/ports/player.port.repository';
import { CreateProfileHandler } from './create-profile.handler';
import { CreateProfileCommand } from './create-profile.command';

describe('CreateProfileHandler', () => {
  it('creates profile if it does not exist', async () => {
    const playerRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: stringToBigNumber('7'),
        userId: stringToBigNumber('42'),
        username: 'player_42',
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateProfileHandler,
        { provide: PlayerPortRepository, useValue: playerRepository },
      ],
    }).compile();

    const handler = moduleRef.get(CreateProfileHandler);
    const result = await handler.execute(
      new CreateProfileCommand({ userId: '42', currencyIsoCode: 'USD' }),
    );

    expect(result.playerId).toBe('7');
    expect(result.userId).toBe('42');
    expect(result.username).toBe('player_42');
  });
});
