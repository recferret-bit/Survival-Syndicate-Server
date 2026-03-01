import { UnauthorizedException } from '@nestjs/common';
import { ReconnectService } from './reconnect.service';

describe('ReconnectService', () => {
  it('returns success when orchestrator returns success', async () => {
    const authJwt = {
      verifyAsync: jest.fn().mockResolvedValue({ id: '42' }),
    };
    const gameServer = {
      requestOrchestratorPlayerReconnect: jest
        .fn()
        .mockResolvedValue({ status: 'success' }),
    };
    const service = new ReconnectService(authJwt as never, gameServer as never);
    const result = await service.reconnect({
      token: 'jwt',
      matchId: 'm1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.playerId).toBe('42');
      expect(result.matchId).toBe('m1');
    }
    expect(gameServer.requestOrchestratorPlayerReconnect).toHaveBeenCalledWith({
      matchId: 'm1',
      playerId: '42',
    });
  });

  it('returns failure when orchestrator returns GRACE_EXPIRED', async () => {
    const authJwt = {
      verifyAsync: jest.fn().mockResolvedValue({ id: '42' }),
    };
    const gameServer = {
      requestOrchestratorPlayerReconnect: jest
        .fn()
        .mockResolvedValue({ status: 'GRACE_EXPIRED' }),
    };
    const service = new ReconnectService(authJwt as never, gameServer as never);
    const result = await service.reconnect({
      token: 'jwt',
      matchId: 'm1',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe('GRACE_EXPIRED');
  });

  it('throws UnauthorizedException when token invalid', async () => {
    const authJwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid')),
    };
    const gameServer = {
      requestOrchestratorPlayerReconnect: jest.fn(),
    };
    const service = new ReconnectService(authJwt as never, gameServer as never);
    await expect(
      service.reconnect({ token: 'bad', matchId: 'm1' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(
      gameServer.requestOrchestratorPlayerReconnect,
    ).not.toHaveBeenCalled();
  });
});
