import { stringToBigNumber } from '@lib/shared';
import { Player } from './player';

describe('Player', () => {
  it('creates player with valid props', () => {
    const player = new Player({
      id: stringToBigNumber('1'),
      userId: stringToBigNumber('10'),
      username: 'player_10',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(player.id.toString()).toBe('1');
    expect(player.userId.toString()).toBe('10');
    expect(player.username).toBe('player_10');
  });

  it('throws on invalid username', () => {
    expect(
      () =>
        new Player({
          id: stringToBigNumber('1'),
          userId: stringToBigNumber('10'),
          username: 'ab',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    ).toThrow();
  });
});
