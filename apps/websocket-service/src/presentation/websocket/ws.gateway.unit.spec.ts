import { WsGateway } from './ws.gateway';

describe('WsGateway', () => {
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
});
