import { CurrencyCode } from '@lib/shared/currency';
import {
  BetPlacedRequestSchema,
  GameServerSubjects,
  ResetWagerCycleRequestSchema,
} from './games.schemas';

describe('lib-game-server games schemas', () => {
  it('validates BetPlacedRequestSchema', () => {
    expect(
      BetPlacedRequestSchema.parse({
        userId: '99',
        betAmount: '500',
        currency: CurrencyCode.USD,
        gameId: 'game-1',
      }),
    ).toBeDefined();
    expect(() =>
      BetPlacedRequestSchema.parse({
        userId: '99',
        betAmount: 'abc',
        currency: CurrencyCode.USD,
        gameId: 'game-1',
      }),
    ).toThrow();
  });

  it('validates ResetWagerCycleRequestSchema', () => {
    expect(
      ResetWagerCycleRequestSchema.parse({
        userId: '99',
        currency: CurrencyCode.USD,
      }),
    ).toEqual({
      userId: '99',
      currency: CurrencyCode.USD,
    });
  });

  it('defines GameServerSubjects constants', () => {
    expect(GameServerSubjects.BET_PLACED).toBe('games.bet.placed.v1');
    expect(GameServerSubjects.EXPIRE_INACTIVE_SESSIONS).toBe(
      'games.sessions.expire-inactive.v1',
    );
  });
});
