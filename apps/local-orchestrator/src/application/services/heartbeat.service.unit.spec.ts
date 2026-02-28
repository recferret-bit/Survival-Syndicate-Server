import { HeartbeatService } from './heartbeat.service';

describe('HeartbeatService', () => {
  it('publishes zone heartbeat', async () => {
    const gameServerPublisher = {
      publishOrchestratorZoneHeartbeat: jest.fn().mockResolvedValue(undefined),
    };
    const envService = {
      get: jest.fn().mockReturnValue('3011'),
    };

    const service = new HeartbeatService(
      gameServerPublisher as never,
      envService as never,
    );
    await service.publishZoneHeartbeat();

    expect(
      gameServerPublisher.publishOrchestratorZoneHeartbeat,
    ).toHaveBeenCalled();
  });

  it('records gameplay heartbeat', () => {
    const gameServerPublisher = {
      publishOrchestratorZoneHeartbeat: jest.fn(),
    };
    const envService = {
      get: jest.fn().mockReturnValue('3011'),
    };

    const service = new HeartbeatService(
      gameServerPublisher as never,
      envService as never,
    );
    service.recordGameplayHeartbeat('gameplay-1');

    expect(service.getLastGameplayHeartbeat('gameplay-1')).toBeDefined();
  });
});
