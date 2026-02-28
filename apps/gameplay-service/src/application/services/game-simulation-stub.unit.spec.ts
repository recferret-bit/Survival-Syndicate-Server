import { GameSimulationStub } from './game-simulation-stub';

describe('GameSimulationStub', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds stub world state with serverTick and empty arrays', () => {
    const publish = jest.fn();
    const stub = new GameSimulationStub('m1', ['10', '11'], publish, 10_000);
    expect(stub.getWorldState()).toEqual({
      serverTick: 0,
      entities_full: [],
      events: [],
    });
    stub.startPublishLoop();
    expect(publish).not.toHaveBeenCalled();
    jest.advanceTimersByTime(10_000);
    expect(publish).toHaveBeenCalledWith({
      serverTick: 1,
      entities_full: [],
      events: [],
    });
    stub.stopPublishLoop();
  });

  it('removePlayer removes id from active set', () => {
    const stub = new GameSimulationStub('m1', ['10', '11'], jest.fn(), 10_000);
    expect(stub.getActivePlayerIds()).toEqual(['10', '11']);
    stub.removePlayer('10');
    expect(stub.getActivePlayerIds()).toEqual(['11']);
  });
});
