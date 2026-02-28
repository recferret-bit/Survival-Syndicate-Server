import { GracePeriodService } from './grace-period.service';

describe('GracePeriodService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts and executes timer callback', async () => {
    const service = new GracePeriodService();
    const callback = jest.fn();

    service.start('match-1', '10', callback);
    expect(service.has('match-1', '10')).toBe(true);

    jest.advanceTimersByTime(60_000);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(service.has('match-1', '10')).toBe(false);
  });

  it('cancels timer', () => {
    const service = new GracePeriodService();
    const callback = jest.fn();

    service.start('match-1', '10', callback);
    service.cancel('match-1', '10');
    jest.advanceTimersByTime(60_000);

    expect(callback).not.toHaveBeenCalled();
  });
});
