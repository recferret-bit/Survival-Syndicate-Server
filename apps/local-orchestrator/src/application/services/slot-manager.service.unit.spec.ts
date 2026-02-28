import { SlotManagerService } from './slot-manager.service';

describe('SlotManagerService', () => {
  it('initializes slots and validates reconnect success', () => {
    const service = new SlotManagerService();
    service.initializeMatchSlots('match-1', ['10', '11']);

    expect(service.hasMatch('match-1')).toBe(true);
    expect(service.evaluateReconnect('match-1', '10')).toBe('success');
  });

  it('returns MATCH_NOT_FOUND and SLOT_NOT_AVAILABLE', () => {
    const service = new SlotManagerService();
    service.initializeMatchSlots('match-1', ['10']);

    expect(service.evaluateReconnect('unknown', '10')).toBe('MATCH_NOT_FOUND');
    expect(service.evaluateReconnect('match-1', '99')).toBe(
      'SLOT_NOT_AVAILABLE',
    );
  });

  it('returns GRACE_EXPIRED when grace is expired', () => {
    const service = new SlotManagerService();
    service.initializeMatchSlots('match-1', ['10']);
    service.markDisconnected('match-1', '10');
    service.markGraceExpired('match-1', '10');

    expect(service.evaluateReconnect('match-1', '10')).toBe('GRACE_EXPIRED');
  });
});
