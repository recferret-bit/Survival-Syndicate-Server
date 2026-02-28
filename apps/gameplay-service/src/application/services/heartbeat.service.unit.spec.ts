import { HeartbeatService } from './heartbeat.service';

describe('HeartbeatService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('publishHeartbeat calls publisher', async () => {
    const publish = jest.fn().mockResolvedValue(undefined);
    const service = new HeartbeatService({
      publishGameplayServiceHeartbeat: publish,
    } as never);
    await service.publishHeartbeat();
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: expect.any(String),
        reportedAt: expect.any(String),
      }),
    );
  });
});
