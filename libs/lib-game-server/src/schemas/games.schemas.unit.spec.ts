import { CurrencyCode } from '@lib/shared/currency';
import {
  BetPlacedRequestSchema,
  GameServerSubjects,
  ResetWagerCycleRequestSchema,
  WorldStateStubSchema,
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
    expect(GameServerSubjects.MATCHMAKING_FOUND_MATCH).toBe(
      'matchmaking.found_match.v1',
    );
    expect(GameServerSubjects.ORCHESTRATOR_PLAYER_RECONNECT_REQUEST).toBe(
      'orchestrator.player.reconnect_request.v1',
    );
    expect(GameServerSubjects.GAMEPLAY_WORLD_STATE_PREFIX).toBe(
      'gameplay.world_state',
    );
  });

  it('validates WorldStateStubSchema', () => {
    expect(
      WorldStateStubSchema.parse({
        serverTick: 0,
        entities_full: [],
        events: [],
      }),
    ).toEqual({ serverTick: 0, entities_full: [], events: [] });
  });
});
