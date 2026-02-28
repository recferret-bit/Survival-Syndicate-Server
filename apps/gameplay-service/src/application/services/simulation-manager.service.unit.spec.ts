import { SimulationManagerService } from './simulation-manager.service';

describe('SimulationManagerService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('create adds simulation and get returns it', () => {
    const publish = jest.fn().mockResolvedValue(undefined);
    const service = new SimulationManagerService({
      publishWorldState: publish,
    } as never);
    service.create('match-1', ['10', '11']);
    const sim = service.get('match-1');
    expect(sim).toBeDefined();
    expect(sim?.matchId).toBe('match-1');
    expect(sim?.playerIds).toEqual(['10', '11']);
    jest.advanceTimersByTime(100);
    expect(publish).toHaveBeenCalled();
    service.destroy('match-1');
    expect(service.get('match-1')).toBeUndefined();
  });

  it('removePlayer delegates to simulation', () => {
    const service = new SimulationManagerService({
      publishWorldState: jest.fn(),
    } as never);
    service.create('match-1', ['10']);
    const sim = service.get('match-1');
    expect(sim?.getActivePlayerIds()).toEqual(['10']);
    service.removePlayer('match-1', '10');
    expect(sim?.getActivePlayerIds()).toEqual([]);
  });
});
