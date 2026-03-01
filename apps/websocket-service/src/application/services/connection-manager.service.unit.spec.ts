import { ConnectionManagerService } from './connection-manager.service';

describe('ConnectionManagerService', () => {
  let service: ConnectionManagerService;

  beforeEach(() => {
    service = new ConnectionManagerService();
  });

  it('register and get', () => {
    service.register('c1', '10', 'match-1');
    expect(service.get('c1')).toEqual({ playerId: '10', matchId: 'match-1' });
  });

  it('getOtherClientsInMatch excludes given client', () => {
    service.register('c1', '10', 'match-1');
    service.register('c2', '11', 'match-1');
    expect(service.getOtherClientsInMatch('match-1', 'c1')).toEqual(['c2']);
    expect(service.getOtherClientsInMatch('match-1', 'c2')).toEqual(['c1']);
  });

  it('unregister removes and returns info', () => {
    service.register('c1', '10', 'match-1');
    const info = service.unregister('c1');
    expect(info).toEqual({ playerId: '10', matchId: 'match-1' });
    expect(service.get('c1')).toBeUndefined();
    expect(service.getOtherClientsInMatch('match-1', 'c2')).toEqual([]);
  });
});
