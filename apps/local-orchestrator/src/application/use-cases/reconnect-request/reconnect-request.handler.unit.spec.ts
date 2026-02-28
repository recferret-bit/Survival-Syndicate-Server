import { ReconnectRequestHandler } from './reconnect-request.handler';
import { ReconnectRequestQuery } from './reconnect-request.query';

describe('ReconnectRequestHandler', () => {
  it('returns success and cancels grace timer', async () => {
    const slotManager = {
      evaluateReconnect: jest.fn().mockReturnValue('success'),
      markConnected: jest.fn(),
    };
    const gracePeriodService = {
      cancel: jest.fn(),
    };

    const handler = new ReconnectRequestHandler(
      slotManager as never,
      gracePeriodService as never,
    );
    const result = await handler.execute(new ReconnectRequestQuery('m1', '10'));

    expect(result.status).toBe('success');
    expect(gracePeriodService.cancel).toHaveBeenCalledWith('m1', '10');
    expect(slotManager.markConnected).toHaveBeenCalledWith('m1', '10');
  });

  it('returns slot error status', async () => {
    const slotManager = {
      evaluateReconnect: jest.fn().mockReturnValue('SLOT_NOT_AVAILABLE'),
      markConnected: jest.fn(),
    };
    const gracePeriodService = {
      cancel: jest.fn(),
    };

    const handler = new ReconnectRequestHandler(
      slotManager as never,
      gracePeriodService as never,
    );
    const result = await handler.execute(new ReconnectRequestQuery('m1', '10'));

    expect(result.status).toBe('SLOT_NOT_AVAILABLE');
  });
});
