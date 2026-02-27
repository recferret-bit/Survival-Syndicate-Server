import { stringToBigNumber } from '@lib/shared';
import { PlayerPrismaMapper } from './player.prisma.mapper';

describe('PlayerPrismaMapper', () => {
  it('maps prisma entity to domain', () => {
    const entity = PlayerPrismaMapper.toDomain({
      id: 1n,
      userId: 10n,
      username: 'player_10',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    });

    expect(entity.id.toString()).toBe('1');
    expect(entity.userId.toString()).toBe('10');
    expect(entity.username).toBe('player_10');
  });

  it('maps create input to prisma payload', () => {
    const payload = PlayerPrismaMapper.toPrismaCreate({
      userId: stringToBigNumber('10'),
      username: 'player_10',
    });

    expect(payload.userId).toBe(10n);
    expect(payload.username).toBe('player_10');
  });
});
