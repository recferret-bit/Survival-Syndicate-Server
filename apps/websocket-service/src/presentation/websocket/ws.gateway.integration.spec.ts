import { Test } from '@nestjs/testing';
import { AuthJwtService } from '@lib/shared/auth';
import { ApplicationModule } from '@app/websocket-service/application/application.module';
import { GameServerPublisher } from '@lib/lib-game-server';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { WsGateway } from './ws.gateway';

describe('WsGateway (Integration)', () => {
  it('authenticate pipeline with mock NATS returns success', async () => {
    const mockReconnect = jest.fn().mockResolvedValue({ status: 'success' });
    const mockPublish = jest.fn().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      imports: [ApplicationModule],
      providers: [WsGateway],
    })
      .overrideProvider(GameServerPublisher)
      .useValue({
        requestOrchestratorPlayerReconnect: mockReconnect,
        publishPlayerConnectionStatus: mockPublish,
      })
      .compile();

    const gateway = moduleRef.get(WsGateway);
    const connectionManager = moduleRef.get(ConnectionManagerService);
    const authJwt = moduleRef.get(AuthJwtService);
    if (authJwt && typeof authJwt.verifyAsync === 'function') {
      jest
        .spyOn(authJwt, 'verifyAsync')
        .mockResolvedValue({ id: '10' } as never);
    }

    const mockClient = { id: 'test-client-1' };
    const result = await gateway.handleMessage(
      JSON.stringify({
        type: 'authenticate',
        token: 'any',
        matchId: 'match-1',
      }),
      mockClient as never,
    );

    expect(result?.data).toBeDefined();
    const data = result?.data as Record<string, unknown>;
    expect(data.type).toBe('authenticate_success');
    expect(data.playerId).toBe('10');
    expect(data.matchId).toBe('match-1');
    expect(connectionManager.get('test-client-1')).toEqual({
      playerId: '10',
      matchId: 'match-1',
    });
    expect(mockReconnect).toHaveBeenCalledWith({
      matchId: 'match-1',
      playerId: '10',
    });
  });
});
