import { WsGateway } from './ws.gateway';

describe('WsGateway', () => {
  it('creates with mocked dependencies', () => {
    const handleAuthenticateUseCase = { execute: jest.fn() };
    const handleReconnectUseCase = { execute: jest.fn() };
    const handleDisconnectUseCase = { execute: jest.fn() };
    const handleInputUseCase = { execute: jest.fn() };
    const gateway = new WsGateway(
      handleAuthenticateUseCase as never,
      handleReconnectUseCase as never,
      handleDisconnectUseCase as never,
      handleInputUseCase as never,
    );
    expect(gateway).toBeDefined();
  });
});
