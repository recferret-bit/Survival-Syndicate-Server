import { Test } from '@nestjs/testing';
import { AuthJwtService } from '@lib/shared/auth';
import { ApplicationModule } from '@app/websocket-service/application/application.module';
import { GameServerPublisher, LibGameServerModule } from '@lib/lib-game-server';
import { ConnectionManagerService } from '@app/websocket-service/application/services/connection-manager.service';
import { WsGateway } from './ws.gateway';

describe('WsGateway', () => {
  const mockReconnect = jest.fn().mockResolvedValue({ status: 'success' });
  const mockPublish = jest.fn().mockResolvedValue(undefined);

  const mockGameServerPublisher = {
    requestOrchestratorPlayerReconnect: mockReconnect,
    publishPlayerConnectionStatus: mockPublish,
  };

  beforeEach(() => {
    mockReconnect.mockClear();
    mockPublish.mockClear();
  });

  it('creates with mocked dependencies', () => {
    const connectionManager = {
      register: jest.fn(),
      unregister: jest.fn(),
      get: jest.fn(),
      getOtherClientsInMatch: jest.fn().mockReturnValue([]),
    };
    const authenticateService = { authenticate: jest.fn() };
    const reconnectService = { reconnect: jest.fn() };
    const lobbyStateSync = {
      getStubState: jest.fn().mockReturnValue({ lobbyId: '', players: [] }),
    };
    const gameServerPublisher = {
      publishPlayerConnectionStatus: jest.fn(),
    };
    const gateway = new WsGateway(
      connectionManager as never,
      authenticateService as never,
      reconnectService as never,
      lobbyStateSync as never,
      gameServerPublisher as never,
    );
    expect(gateway).toBeDefined();
  });

  it('authenticate pipeline with mock NATS returns success', async () => {
    const { gateway, connectionManager } = await createGateway();

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
    expect(mockPublish).toHaveBeenCalledWith({
      matchId: 'match-1',
      playerId: '10',
      status: 'connected',
    });
  });

  it('reconnect pipeline returns success with WorldState and publishes reconnected', async () => {
    const { gateway, connectionManager } = await createGateway();

    const mockClient = { id: 'reconnect-client-1' };
    const result = await gateway.handleMessage(
      JSON.stringify({
        type: 'reconnect',
        token: 'any',
        matchId: 'match-2',
      }),
      mockClient as never,
    );

    expect(result?.data).toBeDefined();
    const data = result?.data as Record<string, unknown>;
    expect(data.type).toBe('reconnect_success');
    expect(data.playerId).toBe('10');
    expect(data.matchId).toBe('match-2');
    expect(data.worldState).toBeDefined();
    expect(data.worldState).toMatchObject({
      serverTick: 0,
      entities_full: [],
      entities_delta: [],
      entities_removed: [],
    });
    expect(connectionManager.get('reconnect-client-1')).toEqual({
      playerId: '10',
      matchId: 'match-2',
    });
    expect(mockReconnect).toHaveBeenCalledWith({
      matchId: 'match-2',
      playerId: '10',
    });
    expect(mockPublish).toHaveBeenCalledWith({
      matchId: 'match-2',
      playerId: '10',
      status: 'reconnected',
    });
  });

  it('reconnect pipeline returns error and closes WS on orchestrator failure', async () => {
    mockReconnect.mockResolvedValueOnce({ status: 'SLOT_NOT_AVAILABLE' });
    const { gateway } = await createGateway();

    const mockClient = {
      id: 'reconnect-client-2',
      readyState: 1,
      close: jest.fn(),
      send: jest.fn(),
    };
    const result = await gateway.handleMessage(
      JSON.stringify({
        type: 'reconnect',
        token: 'any',
        matchId: 'match-3',
      }),
      mockClient as never,
    );

    expect(result?.data).toBeDefined();
    const data = result?.data as Record<string, unknown>;
    expect(data.type).toBe('reconnect_error');
    expect(data.code).toBe('SLOT_NOT_AVAILABLE');
  });

  async function createGateway() {
    const moduleRef = await Test.createTestingModule({
      imports: [ApplicationModule, LibGameServerModule],
      providers: [WsGateway],
    })
      .overrideProvider(GameServerPublisher)
      .useValue(mockGameServerPublisher)
      .compile();

    const gateway = moduleRef.get(WsGateway);
    const connectionManager = moduleRef.get(ConnectionManagerService);
    const authJwt = moduleRef.get(AuthJwtService);
    if (authJwt && typeof authJwt.verifyAsync === 'function') {
      jest
        .spyOn(authJwt, 'verifyAsync')
        .mockResolvedValue({ id: '10' } as never);
    }
    return { gateway, connectionManager };
  }
});
